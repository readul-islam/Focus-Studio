"""Replace remaining hardcoded docs UI strings in root and folder docs pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "app/projects/[id]/docs/page.tsx",
    ROOT / "app/projects/[id]/docs/folders/[...folderId]/page.tsx",
]

pairs = [
    ('<p className="text-lg font-semibold">Drop files here to upload</p>', '<p className="text-lg font-semibold">{t("dropFilesHere")}</p>'),
    ('<p className="text-sm font-medium text-neutral-600">Drop files here to upload</p>', '<p className="text-sm font-medium text-neutral-600">{t("dropFilesHere")}</p>'),
    ('<p className="text-xs text-gray-600 mt-1">Any file larger than 50MB will be rejected</p>', '<p className="text-xs text-gray-600 mt-1">{t("dropFilesReject")}</p>'),
    ('<TooltipContent side="top"><p>View Only</p></TooltipContent>', '<TooltipContent side="top"><p>{t("viewOnly")}</p></TooltipContent>'),
    ('Share Selected ({checkedItems.length})', '{t("shareSelected", { count: checkedItems.length })}'),
    ('Sharing...', '{t("sharing")}'),
    ('Back to Contractors', '{t("backToContractors")}'),
    ('New Folder', '{t("newFolder")}'),
    ('<Send className="w-4 h-4 mr-2" />Send to Client', '<Send className="w-4 h-4 mr-2" />{t("sendToClient")}'),
    ('Send to Client', '{t("sendToClient")}'),
    ("<DropdownMenuItem onSelect={LinkOpenModal}>{'Add Link'}</DropdownMenuItem>", '<DropdownMenuItem onSelect={LinkOpenModal}>{t("addLink")}</DropdownMenuItem>'),
    ("<DropdownMenuItem onSelect={openUploadModal}>{'Upload Files'}</DropdownMenuItem>", '<DropdownMenuItem onSelect={openUploadModal}>{t("uploadFiles")}</DropdownMenuItem>'),
    ('<DialogTitle>Create New Folder</DialogTitle>', '<DialogTitle>{t("createNewFolder")}</DialogTitle>'),
    ('Add Link', '{t("addLinkTitle")}'),
    ('<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">File</th>', '<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t("tableFile")}</th>'),
    ('<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>', '<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t("tableType")}</th>'),
    ('<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created</th>', '<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t("tableCreated")}</th>'),
    ('<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Modified</th>', '<th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t("tableModified")}</th>'),
    ('<th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">Shared</th>', '<th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">{t("tableShared")}</th>'),
    ('<th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">Actions</th>', '<th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">{t("tableActions")}</th>'),
    ('<span className="truncate">Team</span>', '<span className="truncate">{t("team")}</span>'),
    ('<td className="px-4 py-3 text-sm text-gray-600">Link</td>', '<td className="px-4 py-3 text-sm text-gray-600">{t("linkType")}</td>'),
]

for path in FILES:
    text = path.read_text(encoding="utf-8")
    print(f"\n=== {path.name} ===")
    for old, new in pairs:
        if old not in text:
            continue
        n = text.count(old)
        text = text.replace(old, new)
        print(f"  x{n}: {old[:55]}...")
    path.write_text(text, encoding="utf-8")

print("\nDone.")
