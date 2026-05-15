from rest_framework import serializers
from .models import Client, ClientNote, Lead, Proposal, ProposalLineItem


class ClientNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientNote
        fields = ['id', 'note', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    client_notes = ClientNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        exclude = ['password', 'last_login', 'is_active']

    def validate(self, data):
        contact_type = data.get('contact_type', getattr(self.instance, 'contact_type', None))
        supplier_fields = ['trade_login_url', 'supplier_user_id', 'supplier_password']
        if contact_type != 'SP':
            for field in supplier_fields:
                if data.get(field):
                    raise serializers.ValidationError(
                        {field: "This field can only be set on Supplier contacts."}
                    )
        return data

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'

    def validate(self, data):
        # specific validation logic based on the stage
        stage = data.get('stage')
        instance_stage = self.instance.stage if self.instance else None

        # Determine the effective stage (from data or existing instance if not provided)
        current_stage = stage if stage else instance_stage

        if not current_stage:
             # Default to 'new' if creating and no stage provided
             current_stage = 'new'
        
        errors = {}

        # Stage: New
        # Fields: name, phone, source
        # Note: 'name' maps to 'full_name'
        if current_stage == 'new':
            if not data.get('full_name') and (not self.instance or not self.instance.full_name):
                 errors['full_name'] = "Full Name is required for 'New' stage."
            if not data.get('phone') and (not self.instance or not self.instance.phone):
                 errors['phone'] = "Phone is required for 'New' stage."
            if not data.get('source') and (not self.instance or not self.instance.source):
                 errors['source'] = "Source is required for 'New' stage."

        # Stage: Qualified
        # Fields: budget, project info
        if current_stage == 'qualified':
            if not data.get('budget_range') and (not self.instance or not self.instance.budget_range):
                errors['budget_range'] = "Budget Range is required for 'Qualified' stage."
            if not data.get('project_type') and (not self.instance or not self.instance.project_type):
                # Mapping 'project info' to 'project_type'
                errors['project_type'] = "Project Type is required for 'Qualified' stage."

        # Stage: Proposal
        # Fields: estimated_value, proposal_type
        if current_stage == 'proposal':
            if not data.get('estimated_value') and (not self.instance or not self.instance.estimated_value):
                errors['estimated_value'] = "Estimated Value is required for 'Proposal' stage."
            if not data.get('proposal_type') and (not self.instance or not self.instance.proposal_type):
                errors['proposal_type'] = "Proposal Type is required for 'Proposal' stage."

        # Stage: Negotiation
        # Fields: revised_value
        if current_stage == 'negotiation':
             # Assumption: revised_value is required here.
             if not data.get('revised_value') and (not self.instance or not self.instance.revised_value):
                errors['revised_value'] = "Revised Value is required for 'Negotiation' stage."

        # Stage: Won
        # Fields: final_value, deposit, start date
        if current_stage == 'won':
             if not data.get('final_value') and (not self.instance or not self.instance.final_value):
                errors['final_value'] = "Final Value is required for 'Won' stage."
             
             # Check deposit_received is True
             deposit = data.get('deposit_received')
             if deposit is None and self.instance:
                 deposit = self.instance.deposit_received
             if not deposit:
                 errors['deposit_received'] = "Deposit must be received for 'Won' stage."

             if not data.get('project_start_date') and (not self.instance or not self.instance.project_start_date):
                 errors['project_start_date'] = "Project Start Date is required for 'Won' stage."

        # Stage: Lost
        # Fields: loss_reason
        if current_stage == 'lost':
             if not data.get('loss_reason') and (not self.instance or not self.instance.loss_reason):
                 errors['loss_reason'] = "Loss Reason is required for 'Lost' stage."

        if errors:
            raise serializers.ValidationError(errors)

        return data


class ProposalLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalLineItem
        fields = ['id', 'description', 'quantity', 'rate', 'amount']
        read_only_fields = ['amount']


class ProposalSerializer(serializers.ModelSerializer):
    line_items = ProposalLineItemSerializer(many=True, required=False)
    client_name = serializers.SerializerMethodField(read_only=True)
    completeness = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Proposal
        fields = [
            'id', 'title', 'client', 'client_name', 'currency', 'valid_until',
            'cover_message', 'scope_description', 'terms_and_conditions', 'terms_type',
            'tax_rate', 'subtotal', 'tax_amount', 'total',
            'payment_schedule', 'status', 'studio', 'created_by',
            'created_at', 'updated_at', 'line_items', 'completeness',
        ]
        read_only_fields = ['subtotal', 'tax_amount', 'total', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        if obj.client:
            parts = [obj.client.name or '', obj.client.surname or '']
            full = ' '.join(p for p in parts if p).strip()
            return full or obj.client.company_name or ''
        return ''

    def get_completeness(self, obj):
        checks = {
            'client_selected': obj.client_id is not None,
            'title_provided': bool(obj.title),
            'line_items_added': obj.line_items.exists(),
            'contact_email_assigned': bool(obj.client and obj.client.email),
            'scope_defined': bool(obj.scope_description),
            'terms_included': bool(obj.terms_and_conditions),
        }
        completed = sum(checks.values())
        return {'checks': checks, 'completed': completed, 'total': len(checks)}

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items', [])
        proposal = Proposal.objects.create(**validated_data)
        for item_data in line_items_data:
            ProposalLineItem.objects.create(proposal=proposal, **item_data)
        proposal.recalculate_totals()
        proposal.save()
        return proposal

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if line_items_data is not None:
            instance.line_items.all().delete()
            for item_data in line_items_data:
                ProposalLineItem.objects.create(proposal=instance, **item_data)
        instance.recalculate_totals()
        instance.save()
        return instance
