import os

FILE_TYPE_IMAGE = 'image'
FILE_TYPE_VIDEO = 'video'
FILE_TYPE_PDF = 'pdf'
FILE_TYPE_DOCUMENT = 'document'
FILE_TYPE_OTHER = 'other'

IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'}
VIDEO_EXTENSIONS = {'mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv', 'm4v'}
PDF_EXTENSIONS = {'pdf'}
DOCUMENT_EXTENSIONS = {
    'doc', 'docx', 'txt', 'rtf', 'odt',
    'xls', 'xlsx', 'csv', 'ods',
    'ppt', 'pptx', 'odp',
}

ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS | PDF_EXTENSIONS | DOCUMENT_EXTENSIONS

MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024  # 25 MB


def extension_from_name(filename: str) -> str:
    return os.path.splitext(filename or '')[1].lstrip('.').lower()


def classify_file_type(filename: str, content_type: str = '') -> str:
    ext = extension_from_name(filename)
    if ext in IMAGE_EXTENSIONS or (content_type or '').startswith('image/'):
        return FILE_TYPE_IMAGE
    if ext in VIDEO_EXTENSIONS or (content_type or '').startswith('video/'):
        return FILE_TYPE_VIDEO
    if ext in PDF_EXTENSIONS or content_type == 'application/pdf':
        return FILE_TYPE_PDF
    if ext in DOCUMENT_EXTENSIONS:
        return FILE_TYPE_DOCUMENT
    return FILE_TYPE_OTHER


def is_allowed_attachment(filename: str, content_type: str = '') -> bool:
    ext = extension_from_name(filename)
    if ext in ALLOWED_EXTENSIONS:
        return True
    if (content_type or '').startswith(('image/', 'video/')):
        return True
    if content_type in (
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
    ):
        return True
    return False
