from rest_framework import serializers
from datetime import date

class DateSerializer(serializers.Serializer):
    """Handles the nested date objects and converts them to datetime.date."""
    year = serializers.CharField(max_length=4)
    month = serializers.CharField(max_length=2)
    day = serializers.CharField(max_length=2)

    def validate(self, data):
        """Converts the year/month/day strings into a proper datetime.date object."""
        try:
            year = int(data['year'])
            month = int(data['month'])
            day = int(data['day'])
            return date(year, month, day)
        except (ValueError, TypeError) as e:
            raise serializers.ValidationError(f"Invalid date format in payload: {e}")

class LineItemSerializer(serializers.Serializer):
    description = serializers.CharField(max_length=500)
    # Ensure quantity and unit_amount are treated as decimals/floats
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    unit_amount = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    account_code = serializers.CharField(max_length=10)

class InvoiceSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=6) # ACCPAY
    contact = serializers.CharField(max_length=255) # Now a simple string
    invoice_number = serializers.CharField(max_length=50, required=False)
    # Use the custom DateSerializer for nested date objects
    date = DateSerializer()
    due_date = DateSerializer()
    reference = serializers.CharField(max_length=255, required=False)
    line_items = LineItemSerializer(many=True)
    status = serializers.CharField(max_length=10)
    currency_code = serializers.CharField(max_length=3)
    # Note: currency_code is only at the line item level in your provided JSON


class BillSerializer(serializers.Serializer):
    contact_name = serializers.CharField()
    bill_number = serializers.CharField()
    due_date = serializers.DateField()
    line_description = serializers.CharField()
    quantity = serializers.FloatField()
    unit_amount = serializers.FloatField()
