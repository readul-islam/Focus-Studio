from rest_framework import serializers
from django.utils import timezone
from .models import Phase, Room, Project, Procurement
from library.serializers import ProcurementProductSerializer
from crm.serializers import ClientSerializer
from users.serializers import UserSerializer
from comment.serializers import CommentGetSerializer
from task.models import Task
from finance.models import PurchaseOrder
from django.db.models import Sum

class PhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phase
        fields = '__all__'

class StudioPhaseSerializer(serializers.ModelSerializer):
    project_name = serializers.SerializerMethodField()
    project_id = serializers.SerializerMethodField()

    class Meta:
        model = Phase
        fields = ['id', 'name', 'start_date', 'end_date', 'project_name', 'project_id', 'progress']

    def get_project_name(self, obj):
        project = obj.project_set.first()
        return project.project_name if project else None

    def get_project_id(self, obj):
        project = obj.project_set.first()
        return project.id if project else None

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class ProjectGetSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    next_phase = serializers.SerializerMethodField()
    spent = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_progress(self, obj):
        total_tasks = Task.objects.filter(project=obj).count()
        if total_tasks == 0:
            return 0.0
        completed_tasks = Task.objects.filter(project=obj, status='D').count()
        return round((completed_tasks / total_tasks) * 100, 2)

    def get_next_phase(self, obj):
        current_date = timezone.now().date()
        next_phase = obj.phases.filter(start_date__gte=current_date).order_by('end_date').first()
        if next_phase:
            return PhaseSummarySerializer(next_phase).data
        return None

    def get_spent(self, obj):
        return PurchaseOrder.objects.filter(project=obj).aggregate(total=Sum('total_amount'))['total'] or 0.0

class ProcurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procurement
        fields = '__all__'

class ProcurementGetSerializer(serializers.ModelSerializer):
    product = ProcurementProductSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    supplier = serializers.SerializerMethodField()
    display_po = serializers.SerializerMethodField()
    display_invoice = serializers.SerializerMethodField()
    comments = CommentGetSerializer(many=True, read_only=True)
    order_date = serializers.SerializerMethodField()
    internally_approved_by = UserSerializer(read_only=True)

    class Meta:
        model = Procurement
        fields = '__all__'

    def get_supplier(self, obj):
        if obj.product and obj.product.supplier:
            return ClientSerializer(obj.product.supplier).data
        return None
    
    def get_display_po(self, obj):
        if obj.po:
            return f"PO-{obj.po.id:03d}"
        return None
    
    def get_display_invoice(self, obj):
        if obj.invoice:
            return f"INV-{obj.invoice.id:03d}"
        return None

    def get_order_date(self, obj):
        if obj.order_date:
            return obj.order_date.strftime('%d %b, %Y')
        return None

class BudgetUtilizationSerializer(serializers.Serializer):
    total_budget = serializers.FloatField()
    total_po_amount = serializers.FloatField()
    percentage = serializers.FloatField()

class TaskOverviewSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    completed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    remaining = serializers.IntegerField()
    completion_percentage = serializers.FloatField()

class DelayedPOSerializer(serializers.Serializer):
    count = serializers.IntegerField()

class ProcurementStatusSerializer(serializers.Serializer):
    pos_needing_approval = serializers.IntegerField()
    action_required = serializers.BooleanField()

class LatestFileSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    url = serializers.CharField()
    type = serializers.CharField()

class RecentActivitySerializer(serializers.Serializer):
    type = serializers.CharField()
    name = serializers.CharField()
    updated_at = serializers.DateTimeField()

class ProjectOverviewSerializer(serializers.Serializer):
    budget_utilization = BudgetUtilizationSerializer()
    tasks = TaskOverviewSerializer()
    pos_delayed = DelayedPOSerializer()
    procurement_status = ProcurementStatusSerializer()
    latest_files = LatestFileSerializer(many=True)
    recent_activity = RecentActivitySerializer(many=True)

class PhaseSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Phase
        fields = ['id', 'name', 'start_date', 'end_date', 'progress']

class ProjectPhasesSerializer(serializers.ModelSerializer):
    phases = PhaseSummarySerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'project_name', 'phases']

class UserProjectPhasesSerializer(serializers.ModelSerializer):
    projects = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSerializer.Meta.model
        fields = ['id', 'name', 'email', 'title', 'projects', 'pay_per_hour']

    def get_projects(self, obj):
        projects = obj.assigned_projects.all()
        return ProjectPhasesSerializer(projects, many=True).data

class TaskSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'start_date', 'end_date']

class PhaseWithTasksSerializer(serializers.ModelSerializer):
    tasks = TaskSummarySerializer(many=True, read_only=True, source='task_set')
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Phase
        fields = ['id', 'name', 'start_date', 'end_date', 'progress', 'tasks']

    def get_progress(self, obj):
        total = obj.task_set.count()
        if total == 0:
            return 0.0
        completed = obj.task_set.filter(status='D').count()
        return round((completed / total) * 100, 2)