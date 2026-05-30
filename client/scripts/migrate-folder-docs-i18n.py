"""One-off: replace hardcoded English strings in folder docs page with t() calls."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "app/projects/[id]/docs/folders/[...folderId]/page.tsx"
text = PATH.read_text(encoding="utf-8")

pairs = [
    ("toast.error('Download failed')", "toast.error(t('downloadFailed'))"),
    ("toast.info('Opening PDF in new tab')", "toast.info(t('openPdfHint'))"),
    ("toast.success('Link added!')", "toast.success(t('linkAdded'))"),
    ("toast.error('Failed to add link')", "toast.error(t('linkAddFailed'))"),
    (
        "toast.error(`${oversizedFiles.length} file(s) exceed the 50MB size limit!`)",
        "toast.error(t('oversizedFiles', { count: oversizedFiles.length }))",
    ),
    (
        "{ loading: 'Uploading...', success: 'Uploaded successfully!', error: 'Failed to upload document.' }",
        "{ loading: t('uploading'), success: t('uploadedSuccess'), error: t('uploadDocumentFailed') }",
    ),
    (
        "toast.update(uploadToastId, { title: `All ${selectedFiles.length} files uploaded successfully!`, type: 'success' })",
        "toast.update(uploadToastId, { title: t('uploadAllSuccess', { count: selectedFiles.length }), type: 'success' })",
    ),
    (
        "toast.update(uploadToastId, { title: `Uploaded ${completed}/${selectedFiles.length} files successfully.`, type: 'warning' })",
        "toast.update(uploadToastId, { title: t('uploadPartialSuccess', { completed, total: selectedFiles.length }), type: 'warning' })",
    ),
    (
        "toast.update(uploadToastId, { title: 'Failed to upload all files.', type: 'error' })",
        "toast.update(uploadToastId, { title: t('uploadAllFailed'), type: 'error' })",
    ),
    ("toast.error('Folder name cannot be empty')", "toast.error(t('folderNameEmpty'))"),
    (
        "toast.error(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`)",
        "toast.error(t('folderNameMax', { max: MAX_FOLDER_NAME_LENGTH }))",
    ),
    (
        "{ loading: 'Creating folder...', success: 'Folder created successfully!', error: 'Failed to create folder.' }",
        "{ loading: t('creatingFolder'), success: t('folderCreatedSuccess'), error: t('folderCreateFailed') }",
    ),
    (
        "{ loading: 'Deleting...', success: 'Deleted successfully!', error: 'Failed to delete file.' }",
        "{ loading: t('deleting'), success: t('deletedSuccess'), error: t('deleteFileFailed') }",
    ),
    ("toast.error('Link cannot be empty')", "toast.error(t('linkEmpty'))"),
    ("toast.error('This URL appears to be a test or example URL')", "toast.error(t('linkTestUrl'))"),
    (
        "toast.error('Please enter a valid URL (starting with http:// or https://)')",
        "toast.error(t('linkInvalidUrl'))",
    ),
    (
        "{ loading: 'Renaming...', success: 'Renamed successfully!', error: 'Failed to rename folder.' }",
        "{ loading: t('renaming'), success: t('renamedSuccess'), error: t('renameFolderFailed') }",
    ),
    (
        "{ loading: 'Renaming file...', success: 'File renamed successfully!', error: 'Failed to rename file.' }",
        "{ loading: t('renamingFile'), success: t('fileRenamedSuccess'), error: t('renameFileFailed') }",
    ),
    ("toast.info('Feature not available')", "toast.info(t('featureNotAvailable'))"),
    ("toast('Error! Try again')", "toast(t('genericError'))"),
    ("toast.error('No documents selected to send')", "toast.error(t('noDocumentsSelected'))"),
    (
        "toast.success(`${checkedItems.length} document${checkedItems.length > 1 ? 's' : ''} sent to client!`)",
        "toast.success(t('documentsSentBulk', { count: checkedItems.length }))",
    ),
    ("toast.error('Failed to send documents to client!')", "toast.error(t('documentsSendFailed'))"),
    ("toast.success('Document sent to client!')", "toast.success(t('documentSent'))"),
    ("toast.error('Failed to send document to client!')", "toast.error(t('documentSendFailed'))"),
    (
        "toast.success(`${checkedItems.length} document${checkedItems.length > 1 ? 's' : ''} shared with ${contractorName ? decodeURIComponent(contractorName) : 'contractor'}`)",
        "toast.success(t('documentsShared', { count: checkedItems.length, name: contractorName ? decodeURIComponent(contractorName) : t('documentsSharedContractor') }))",
    ),
    ("toast.error(error?.message || 'Failed to share documents')", "toast.error(error?.message || t('documentsShareFailed'))"),
    ("toast.info('Right-click the image and select \"Save Image As\" to download')", "toast.info(t('saveImageHint'))"),
    ('placeholder="Search files..."', 'placeholder={t("searchFilesOnly")}'),
    ('placeholder="Sort by"', 'placeholder={t("sortBy")}'),
    ('placeholder="Client"', 'placeholder={t("clientFilter")}'),
    ('aria-label="Grid view"', 'aria-label={t("gridView")}'),
    ('aria-label="List view"', 'aria-label={t("listView")}'),
    ("toast.success('Copied!');", "toast.success(t('copied'));"),
    ("toast.success('Copied !');", "toast.success(t('copied'));"),
    ('<p className="text-xs text-neutral-500 mt-1">or click "Upload Files" button</p>', '<p className="text-xs text-neutral-500 mt-1">{t("dropHint")}</p>'),
    (
        '<p className="text-xs text-neutral-500">Select documents below and click "Share Selected" to share with this contractor</p>',
        '<p className="text-xs text-neutral-500">{t("sharingHint")}</p>',
    ),
    ('placeholder="Folder Name"', 'placeholder={t("folderName")}'),
    ('placeholder="Link Name (optional)"', 'placeholder={t("linkNameOptional")}'),
    ('placeholder="Enter URL (https://...)"', 'placeholder={t("enterUrl")}'),
    ('placeholder="New File Name"', 'placeholder={t("newFileName")}'),
    ('title="Download"', 'title={t("download")}'),
    ('aria-label="Preview"', 'aria-label={t("preview")}'),
    ('aria-label="Download"', 'aria-label={t("download")}'),
    ('aria-label="More"', 'aria-label={t("more")}'),
    (
        'description="Are you sure you want to delete this item? This action cannot be undone."',
        'description={t("deleteConfirmDesc")}',
    ),
    ('<SelectItem value="name-asc">Alphabet (A-Z)</SelectItem>', '<SelectItem value="name-asc">{t("sortNameAsc")}</SelectItem>'),
    ('<SelectItem value="name-desc">Alphabet (Z-A)</SelectItem>', '<SelectItem value="name-desc">{t("sortNameDesc")}</SelectItem>'),
    ('<SelectItem value="date-desc">Date (Newest)</SelectItem>', '<SelectItem value="date-desc">{t("sortDateDesc")}</SelectItem>'),
    ('<SelectItem value="date-asc">Date (Oldest)</SelectItem>', '<SelectItem value="date-asc">{t("sortDateAsc")}</SelectItem>'),
    ('<SelectItem value="all">All Items</SelectItem>', '<SelectItem value="all">{t("allItems")}</SelectItem>'),
    ('<SelectItem value="shared">Shared</SelectItem>', '<SelectItem value="shared">{t("shared")}</SelectItem>'),
    ('<SelectItem value="not-shared">Not Shared</SelectItem>', '<SelectItem value="not-shared">{t("notShared")}</SelectItem>'),
    ('<h3 className="mb-4 text-sm font-medium text-neutral-900">Files & Folders</h3>', '<h3 className="mb-4 text-sm font-medium text-neutral-900">{t("filesAndFolders")}</h3>'),
    (
        '<p className="text-sm font-medium text-neutral-900">Sharing documents with {decodeURIComponent(contractorName)}</p>',
        '<p className="text-sm font-medium text-neutral-900">{t("sharingWith", { name: decodeURIComponent(contractorName) })}</p>',
    ),
]

for old, new in pairs:
    if old not in text:
        print(f"SKIP (not found): {old[:60]}...")
        continue
    count = text.count(old)
    text = text.replace(old, new)
    print(f"OK x{count}: {old[:50]}...")

PATH.write_text(text, encoding="utf-8")
print("Done.")
