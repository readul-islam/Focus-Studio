from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers

from .models import ChangeLog
from .serializers import ChangeLogSerializer
from .pagination import ChangeLogPagination


CHANGE_TYPE_ENUM = ['feature', 'fix', 'improvement', 'breaking', 'other']

paginated_changelog_response = inline_serializer(
    name='PaginatedChangeLogResponse',
    fields={
        'count': serializers.IntegerField(help_text='Total number of changelog entries'),
        'total_pages': serializers.IntegerField(help_text='Total number of pages'),
        'current_page': serializers.IntegerField(help_text='Current page number'),
        'next': serializers.CharField(allow_null=True, help_text='URL to the next page, or null if on the last page'),
        'previous': serializers.CharField(allow_null=True, help_text='URL to the previous page, or null if on the first page'),
        'results': ChangeLogSerializer(many=True),
    }
)


@extend_schema(tags=['Changelog'])
class ChangeLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ChangeLog.objects.all()
    serializer_class = ChangeLogSerializer
    permission_classes = [AllowAny]
    pagination_class = ChangeLogPagination
    filterset_fields = ['change_type', 'date']

    @extend_schema(
        summary='List changelog entries',
        description=(
            'Returns a paginated list of all system changelog entries ordered by date descending. '
            'Use `change_type` to filter by the type of change, and `date` to filter by a specific release date. '
            'Changelog entries are managed via Django Admin.'
        ),
        parameters=[
            OpenApiParameter(
                name='change_type',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by change type.',
                enum=CHANGE_TYPE_ENUM,
                required=False,
            ),
            OpenApiParameter(
                name='date',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='Filter by exact release date (YYYY-MM-DD).',
                required=False,
            ),
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Page number (default: 1).',
                required=False,
            ),
            OpenApiParameter(
                name='page_size',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Number of results per page (default: 20, max: 100).',
                required=False,
            ),
        ],
        responses={
            200: paginated_changelog_response,
        },
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary='Retrieve a changelog entry',
        description='Returns the details of a single changelog entry by its ID.',
        responses={
            200: ChangeLogSerializer,
            404: OpenApiTypes.OBJECT,
        },
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
