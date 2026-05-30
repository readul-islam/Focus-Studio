"""Replace hardcoded strings in project settings page with t() calls."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "app/projects/[id]/settings/page.tsx"
text = PATH.read_text(encoding="utf-8")

pairs = [
    ('title="Delete Project"', 'title={t("deleteProjectTitle")}'),
    ('title="Remove Secondary Client"', 'title={t("removeSecondaryClientTitle")}'),
    ('confirmText="Remove"', 'confirmText={t("remove")}'),
    ('confirmText="Delete"', 'confirmText={t("delete")}'),
    ('<CardTitle className="text-base">Contacts & Access</CardTitle>', '<CardTitle className="text-base">{t("contactsTitle")}</CardTitle>'),
    ('Select Primary Client <span className="text-red-500">*</span>', '{t("selectPrimaryClient")} <span className="text-red-500">*</span>'),
    ('Copy Portal Info', '{t("copyPortalInfo")}'),
    ('placeholder="Enter room name..."', 'placeholder={t("enterRoomName")}'),
    ('title="Delete Room"', 'title={t("deleteRoomTitle")}'),
    ('description="Are you sure you want to delete this room? This action cannot be undone."', 'description={t("deleteRoomDesc")}'),
    ('No addresses found', '{t("noAddressesFound")}'),
    ('<Label>Access & parking notes</Label>', '<Label>{t("accessParkingNotes")}</Label>'),
    ('<Label>Building restrictions</Label>', '<Label>{t("buildingRestrictions")}</Label>'),
    ('placeholder="Street address"', 'placeholder={t("streetAddress")}'),
    ('placeholder="Apartment, suite, etc."', 'placeholder={t("addressLine2")}'),
    ('placeholder="City"', 'placeholder={t("city")}'),
    ('placeholder="Postcode"', 'placeholder={t("postcode")}'),
    ('placeholder="County"', 'placeholder={t("county")}'),
    ('placeholder="Country"', 'placeholder={t("country")}'),
    ('placeholder="modern, warm minimalism"', 'placeholder={t("styleKeywords")}'),
    ('placeholder="Vendor A, Vendor B"', 'placeholder={t("preferredVendors")}'),
    ('placeholder="850000"', 'placeholder={t("budgetPlaceholder")}'),
    ('placeholder="20"', 'placeholder={t("marginPlaceholder")}'),
    ('placeholder="0"', 'placeholder={t("contingencyPlaceholder")}'),
    ('placeholder="Search teammates…"', 'placeholder={t("searchTeammates")}'),
    ('No team members assigned yet. Click "Add Member" to get started.', '{t("noTeamMembers")}'),
    ('title="Remove Member"', 'title={t("removeMemberTitle")}'),
    ("toast.error('Access token not available yet')", "toast.error(t('accessTokenUnavailable'))"),
    ("toast.success('Link copied to clipboard')", "toast.success(t('linkCopied'))"),
    (".then(() => toast.success('Contractor info copied'))", ".then(() => toast.success(t('contractorInfoCopied')))"),
    ("toast.success('Contractor info copied')", "toast.success(t('contractorInfoCopied')"),
    ("toast.error('Error copying contractor info')", "toast.error(t('copyError')"),
    ("toast.success('Invitation sent to contractor!')", "toast.success(t('inviteContractorSent')"),
    ('description="Send invitation email to contractor portal"', 'description={t("inviteContractorDesc")}'),
    ("toast.error('Failed to add task')", "toast.error(t('addTaskFailed')"),
    ("toast.error('Failed to delete task')", "toast.error(t('deleteTaskFailed')"),
    ('placeholder="Add a task..."', 'placeholder={t("addTaskPlaceholder")}'),
    ("toast.success('Phase updated')", "toast.success(t('phaseUpdated')"),
    ("toast.error('Failed to update phase')", "toast.error(t('phaseUpdateFailed')"),
    ("toast.error('Error updating project')", "toast.error(t('updateError')"),
    ("toast.error('Failed to add phase')", "toast.error(t('addPhaseFailed')"),
    ("toast.success('Phase deleted')", "toast.success(t('phaseDeleted')"),
    ("toast.error('Failed to delete phase')", "toast.error(t('deletePhaseFailed')"),
    ('title="Add phase"', 'title={t("addPhaseTitle")}'),
    ('title="Delete Phase"', 'title={t("deletePhaseTitle")}'),
    ('placeholder="e.g. Discovery & Planning"', 'placeholder={t("phaseNamePlaceholder")}'),
    ('placeholder="Brief description..."', 'placeholder={t("phaseDescPlaceholder")}'),
    ("{rooms.length === 1 ? 'Room' : 'Rooms'}", '{rooms.length === 1 ? t("roomSingular") : t("roomsPlural")}'),
]

for old, new in pairs:
    if old not in text:
        print(f"SKIP: {old[:50]}")
        continue
    n = text.count(old)
    text = text.replace(old, new)
    print(f"OK x{n}: {old[:45]}")

# ContactsForm needs its own t
if "function ContactsForm" in text and "const t = useTranslations('projectSettingsPage')" not in text.split("function ContactsForm")[1].split("function ")[0]:
    text = text.replace(
        "function ContactsForm({\n  value,",
        "function ContactsForm({\n  value,",
    )
    text = text.replace(
        "}) {\n  const [isDeleteOpen, setIsDeleteOpen] = useState(false);",
        "}) {\n  const t = useTranslations('projectSettingsPage');\n  const [isDeleteOpen, setIsDeleteOpen] = useState(false);",
        1,
    )

PATH.write_text(text, encoding="utf-8")
print("Done.")
