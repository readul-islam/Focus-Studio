from rest_framework import serializers

from design.serializers import DesignAssetSerializer
from library.models import Product, ProductImage
from .models import Presentation, PresentationSlide, PresentationPin, PresentationComment


def _absolute_media_url(file_field, request):
    if not file_field:
        return None
    try:
        url = file_field.url
    except Exception:
        return None
    if not url:
        return None
    if url.startswith(('http://', 'https://')):
        return url
    if request:
        return request.build_absolute_uri(url)
    return url


class PresentationPinSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_image_url = serializers.SerializerMethodField()
    product_price = serializers.SerializerMethodField()
    scene_image_url = serializers.SerializerMethodField()
    presentation_id = serializers.IntegerField(source='slide.presentation_id', read_only=True)
    slide_id = serializers.IntegerField(source='slide.id', read_only=True)

    class Meta:
        model = PresentationPin
        fields = [
            'id', 'slide', 'slide_id', 'presentation_id', 'pin_type', 'product', 'design_asset',
            'x', 'y', 'label', 'show_pricing', 'product_name', 'product_image_url',
            'product_price', 'scene_image_url', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_product_name(self, obj):
        return obj.product.name if obj.product_id else None

    def get_product_image_url(self, obj):
        if not obj.product_id:
            return None
        request = self.context.get('request')
        primary = ProductImage.objects.filter(product=obj.product, is_primary=True).first()
        if not primary:
            primary = ProductImage.objects.filter(product=obj.product).first()
        return _absolute_media_url(primary.image if primary else None, request)

    def get_product_price(self, obj):
        if not obj.product_id:
            return None
        return obj.product.retail_price

    def get_scene_image_url(self, obj):
        if not obj.design_asset_id:
            return None
        request = self.context.get('request')
        return _absolute_media_url(obj.design_asset.file, request)


class PresentationCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PresentationComment
        fields = [
            'id', 'slide', 'x', 'y', 'text', 'author_type', 'author_name',
            'created_by', 'created_at',
        ]
        read_only_fields = ['created_by', 'created_at']


def _resolve_slide_background_url(obj, request):
    file_url = _absolute_media_url(obj.background_image, request)
    if file_url:
        return file_url
    src = (obj.background_src or '').strip()
    if not src:
        return None
    if src.startswith(('http://', 'https://', 'data:', 'blob:')):
        return src
    if request:
        return request.build_absolute_uri(src)
    return src


class PresentationSlideSerializer(serializers.ModelSerializer):
    pins = PresentationPinSerializer(many=True, read_only=True)
    comments = PresentationCommentSerializer(many=True, read_only=True)
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PresentationSlide
        fields = [
            'id', 'presentation', 'order', 'title', 'background_color',
            'background_image', 'background_src', 'background_image_url', 'canvas_data',
            'pins', 'comments', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_background_image_url(self, obj):
        return _resolve_slide_background_url(obj, self.context.get('request'))

    def _clear_background_file(self, instance):
        if instance.background_image:
            instance.background_image.delete(save=False)
            instance.background_image = None

    def update(self, instance, validated_data):
        background_src = validated_data.pop('background_src', serializers.empty)
        if background_src is not serializers.empty:
            src = (background_src or '').strip()
            if src:
                self._clear_background_file(instance)
                validated_data['background_src'] = src
            else:
                validated_data['background_src'] = ''

        if 'background_image' in validated_data:
            if validated_data['background_image']:
                validated_data['background_src'] = ''
            elif validated_data['background_image'] is None:
                self._clear_background_file(instance)
                validated_data.pop('background_image', None)

        return super().update(instance, validated_data)


class PresentationListSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    slide_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    pin_count = serializers.SerializerMethodField()

    class Meta:
        model = Presentation
        fields = [
            'id', 'title', 'project', 'project_name', 'thumbnail_url', 'slide_count',
            'pin_count', 'client_dashboard_published', 'web_published', 'public_token',
            'show_product_pricing', 'show_supplier_info', 'created_by',
            'created_at', 'updated_at',
        ]

    def get_slide_count(self, obj):
        return obj.slides.count()

    def get_pin_count(self, obj):
        return PresentationPin.objects.filter(slide__presentation=obj).count()

    def get_thumbnail_url(self, obj):
        return _absolute_media_url(obj.thumbnail, self.context.get('request'))


class PresentationDetailSerializer(PresentationListSerializer):
    slides = PresentationSlideSerializer(many=True, read_only=True)

    class Meta(PresentationListSerializer.Meta):
        fields = PresentationListSerializer.Meta.fields + ['slides']


class PresentationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presentation
        fields = ['id', 'title', 'project']

    def create(self, validated_data):
        presentation = Presentation.objects.create(**validated_data)
        PresentationSlide.objects.create(
            presentation=presentation,
            order=0,
            title='Slide 1',
        )
        return presentation


class SlideReorderSerializer(serializers.Serializer):
    slide_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)


class PublishPresentationSerializer(serializers.Serializer):
    client_dashboard_published = serializers.BooleanField(required=False)
    web_published = serializers.BooleanField(required=False)
    show_product_pricing = serializers.BooleanField(required=False)
    show_supplier_info = serializers.BooleanField(required=False)


def _absolute_canvas_src(src, request):
    if not src or not isinstance(src, str):
        return src
    if src.startswith(('http://', 'https://', 'data:', 'blob:')):
        return src
    if request and src.startswith('/'):
        return request.build_absolute_uri(src)
    return src


def _normalize_canvas_data(canvas_data, request):
    if not isinstance(canvas_data, list):
        return []
    normalized = []
    for element in canvas_data:
        if not isinstance(element, dict):
            continue
        props = element.get('props')
        if isinstance(props, dict) and props.get('src'):
            element = {
                **element,
                'props': {
                    **props,
                    'src': _absolute_canvas_src(props.get('src'), request),
                },
            }
        normalized.append(element)
    return normalized


class PublicPresentationSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    slides = serializers.SerializerMethodField()

    class Meta:
        model = Presentation
        fields = [
            'id', 'title', 'project_name', 'show_product_pricing', 'show_supplier_info',
            'slides',
        ]

    def get_slides(self, obj):
        request = self.context.get('request')
        data = PresentationSlideSerializer(
            obj.slides.order_by('order'),
            many=True,
            context=self.context,
        ).data
        for slide in data:
            slide['canvas_data'] = _normalize_canvas_data(slide.get('canvas_data'), request)
        return data


class ClientPresentationSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.project_name', read_only=True)
    slide_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Presentation
        fields = [
            'id', 'title', 'project', 'project_name', 'thumbnail_url', 'slide_count',
            'updated_at',
        ]

    def get_slide_count(self, obj):
        return obj.slides.count()

    def get_thumbnail_url(self, obj):
        return _absolute_media_url(obj.thumbnail, self.context.get('request'))
