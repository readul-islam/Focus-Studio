from rest_framework import serializers
from .models import Product, ProductImage
from crm.serializers import ClientSerializer

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'
        read_only_fields = ['created_at']

class ProductImageUpdateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ProductImage
        fields = '__all__'
        read_only_fields = ['created_at']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ProductUpdateSerializer(serializers.ModelSerializer):
    images = ProductImageUpdateSerializer(many=True)

    class Meta:
        model = Product
        fields = '__all__'

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:

            for img_data in images_data:
                img_id = img_data.get("id")

                if img_id:
                    try:
                        image_obj = ProductImage.objects.get(id=img_id, product=instance)
                    except ProductImage.DoesNotExist:
                        continue

                    for key, value in img_data.items():
                        if key != "id":
                            setattr(image_obj, key, value)
                    image_obj.save()

                else:
                    ProductImage.objects.create(product=instance, **img_data)

        return instance


class ProductGetSerializer(serializers.ModelSerializer):
    supplier = ClientSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    regular_price = serializers.SerializerMethodField()
    tader_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'

    def get_regular_price(self, obj):
        if obj.regular_price is not None:
            return f"{obj.regular_price:.2f}"
        return None

    def get_tader_price(self, obj):
        if obj.tader_price is not None:
            return f"{obj.tader_price:.2f}"
        return None

class ProcurementProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
