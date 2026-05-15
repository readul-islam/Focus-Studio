from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes, inline_serializer
from rest_framework import serializers as drf_serializers
from techstyles.mixins import StudioScopedMixin

class DocumentViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    filterset_fields = ['project', 'parent', 'type']
    

    @action(detail=False, methods=['get'])
    def root_documents(self, request):
        project_id = request.query_params.get('project_id')

        try:
        
            queryset = self.get_queryset().filter(parent__isnull=True, project_id=project_id)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except:
            return Response([])

    @action(detail=True, methods=['get'])
    def folder_content(self, request, pk=None):
        folder = self.get_object()
        children = folder.children.all()
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_client_access(self, request, pk=None):
        """
        Update client_access to True for a specific document and all its parents.
        """
        document = self.get_object()
        
        # Update current document
        if not document.client_access:
            document.client_access = True
            document.save(update_fields=['client_access'])
            
        # Update all parents recursively
        current = document.parent
        while current:
            if not current.client_access:
                current.client_access = True
                current.save(update_fields=['client_access'])
            current = current.parent
            
        return Response({'message': 'Client access updated successfully'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def move_documents(self, request):
        document_ids = request.data.get('document_ids', [])
        parent_id = request.data.get('parent_id')

        studio = self.request.user.studio
        if parent_id:
            try:
                parent = Document.objects.get(id=parent_id, studio=studio)
                if parent.type != 'FOLDER':
                    return Response({'error': 'Target is not a folder'}, status=status.HTTP_400_BAD_REQUEST)
            except Document.DoesNotExist:
                return Response({'error': 'Parent folder not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            parent = None

        documents = Document.objects.filter(id__in=document_ids, studio=studio)
        for doc in documents:
            doc.parent = parent
            if request.user.is_authenticated:
                doc.updated_by = request.user
            doc.save()

        return Response({'message': f'Moved {documents.count()} documents successfully'}, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['documents'],
        summary='Upload a new version of a document',
        description=(
            'Replaces the file on an existing document with a new version. '
            'Send as multipart/form-data with `document_id` and `file`. '
            'Only works on documents of type FILE. '
            'All sharing flags (client_access, contractor_access) are preserved on the same record, '
            'so the updated file is automatically visible on both the client portal and contractor portal '
            'wherever the document was already shared. '
            'The old file is deleted from storage before the new one is saved.'
        ),
        request=inline_serializer(
            name='UploadNewVersionRequest',
            fields={
                'document_id': drf_serializers.IntegerField(help_text='ID of the document to replace.'),
                'file': drf_serializers.FileField(help_text='The new file to replace the existing one.'),
            },
        ),
        responses={
            200: DocumentSerializer,
            400: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT,
        },
    )
    @action(detail=False, methods=['post'], url_path='upload-new-version')
    def upload_new_version(self, request):
        document_id = request.data.get('document_id')
        if not document_id:
            return Response(
                {'error': 'document_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            document = Document.objects.get(pk=document_id)
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if document.type != 'FILE':
            return Response(
                {'error': 'Only FILE type documents can have a new version uploaded.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_file = request.FILES.get('file')
        if not new_file:
            return Response(
                {'error': 'A file must be provided in the request.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete the old file from storage before replacing
        if document.file:
            document.file.delete(save=False)

        document.file = new_file
        if request.user.is_authenticated:
            document.updated_by = request.user
        document.save(update_fields=['file', 'updated_by', 'updated_at'])

        serializer = self.get_serializer(document)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def bulk_update_client_access(self, request):
        document_ids = request.data.get('document_ids', [])
        access = request.data.get('access', False)

        documents = Document.objects.filter(id__in=document_ids, studio=self.request.user.studio)
        
        for document in documents:
            if access:
                # If granting access, enable for document and all parents recursively
                if not document.client_access:
                    document.client_access = True
                    document.save(update_fields=['client_access'])
                
                # Update all parents recursively to ensure they are visible
                current = document.parent
                while current:
                    if not current.client_access:
                        current.client_access = True
                        current.save(update_fields=['client_access'])
                    current = current.parent
            else:
                # If revoking access, only disable for current document
                if document.client_access:
                    document.client_access = False
                    document.save(update_fields=['client_access'])

        return Response({'message': 'Client access updated successfully'}, status=status.HTTP_200_OK)
