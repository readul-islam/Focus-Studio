"""Batch 8: settings page i18n strings."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "app/projects/[id]/settings/page.tsx"
text = PATH.read_text(encoding="utf-8")

# Add t hook to forms missing it
hooks = [
    ("function AddressFields({ prefix, value, onChange,projectEditPermission }", "function AddressFields({ prefix, value, onChange,projectEditPermission }"),
]
if "function AddressFields" in text and "AddressFields" in text.split("function AddressFields")[1].split("\n")[0:3].__str__():
    pass

replacements = [
    ("<CommandEmpty>No clients found</CommandEmpty>", "<CommandEmpty>{t('noClientsFound')}</CommandEmpty>"),
    ('<p className="text-sm text-muted-foreground">No secondary clients added. Use the dropdown above to add secondary clients.</p>', '<p className="text-sm text-muted-foreground">{t("noSecondaryClientsHint")}</p>'),
    ("<p>No rooms added yet.</p>", "<p>{t('noRoomsYet')}</p>"),
    ('<p className="text-xs mt-1">Add rooms to organize your project spaces.</p>', '<p className="text-xs mt-1">{t("addRoomsHint")}</p>'),
    ("<Label>Address Line 1</Label>", "<Label>{t('addressLine1')}</Label>"),
    ("<Label>Address Line 2</Label>", "<Label>{t('addressLine2Label')}</Label>"),
    ("<Label>City</Label>", "<Label>{t('city')}</Label>"),
    ("<Label>Postcode</Label>", "<Label>{t('postcode')}</Label>"),
    ("<Label>County</Label>", "<Label>{t('county')}</Label>"),
    ("<Label>Country</Label>", "<Label>{t('country')}</Label>"),
    ('<CardTitle className="text-base">Addresses</CardTitle>', '<CardTitle className="text-base">{t("addressesTitle")}</CardTitle>'),
    ('<TabsTrigger value="delivery">Delivery</TabsTrigger>', '<TabsTrigger value="delivery">{t("deliveryTab")}</TabsTrigger>'),
    ('<TabsTrigger value="billing">Billing</TabsTrigger>', '<TabsTrigger value="billing">{t("billingTab")}</TabsTrigger>'),
    ('<TabsTrigger value="logistics">Logistics</TabsTrigger>', '<TabsTrigger value="logistics">{t("logisticsTab")}</TabsTrigger>'),
    ('<CardTitle className="text-base">Preferences & Consent</CardTitle>', '<CardTitle className="text-base">{t("preferencesConsentTitle")}</CardTitle>'),
    ("<Label>Style tags</Label>", "<Label>{t('styleTags')}</Label>"),
    ("<Label>Preferred vendors</Label>", "<Label>{t('preferredVendorsLabel')}</Label>"),
    ('<span className="text-sm">Marketing opt‑in</span>', '<span className="text-sm">{t("marketingOptIn")}</span>'),
    ('<CardTitle className="text-base">Timeline</CardTitle>', '<CardTitle className="text-base">{t("timelineTitle")}</CardTitle>'),
    ('<Label className="block mb-2">Project Duration</Label>', '<Label className="block mb-2">{t("projectDuration")}</Label>'),
    ('<Label htmlFor="timezone">Timezone</Label>', '<Label htmlFor="timezone">{t("timezone")}</Label>'),
    ("London (GMT)", '{t("timezoneLondon")}'),
    ("New York (EST)", '{t("timezoneNewYork")}'),
    ("Paris (CET)", '{t("timezoneParis")}'),
    ('<CardTitle className="text-base">Financial</CardTitle>', '<CardTitle className="text-base">{t("financialTitle")}</CardTitle>'),
    ('<Label htmlFor="budget">Budget</Label>', '<Label htmlFor="budget">{t("budget")}</Label>'),
    ('<Label htmlFor="taxRate">Tax/VAT rate (%)</Label>', '<Label htmlFor="taxRate">{t("taxRate")}</Label>'),
    ('<Label htmlFor="currency">Currency</Label>', '<Label htmlFor="currency">{t("currency")}</Label>'),
    ('<CardTitle className="text-base">Automation</CardTitle>', '<CardTitle className="text-base">{t("automationTitle")}</CardTitle>'),
    ('<div className="text-sm font-medium">Kickoff Pack</div>', '<div className="text-sm font-medium">{t("kickoffPack")}</div>'),
    ('<div className="text-sm font-medium">Notifications</div>', '<div className="text-sm font-medium">{t("notifications")}</div>'),
    ('<CardTitle className="text-base mb-5">Team Members</CardTitle>', '<CardTitle className="text-base mb-5">{t("teamMembersTitle")}</CardTitle>'),
    ("<CommandEmpty>No people found.</CommandEmpty>", "<CommandEmpty>{t('noPeopleFound')}</CommandEmpty>"),
    ('<CardTitle className="text-base">Contractor Access</CardTitle>', '<CardTitle className="text-base">{t("contractorAccessTitle")}</CardTitle>'),
    (">\n                Print\n", ">\n                {t('print')}\n"),
    ("Note: Print this QR code and display it on site. Contractors can scan to access their project files.", '{t("qrPrintNote")}'),
    ('<p className="font-medium">Access token pending</p>', '<p className="font-medium">{t("accessTokenPending")}</p>'),
    ("The project access token will be available soon. Contact support if this persists.", '{t("accessTokenPendingHint")}'),
    ("<p>Scan to access the contractor portal</p>", "<p>{t('scanContractorPortal')}</p>"),
    ('<CardTitle className="text-base">Contractors</CardTitle>', '<CardTitle className="text-base">{t("contractorsTitle")}</CardTitle>'),
]

for old, new in replacements:
    if old not in text:
        continue
    text = text.replace(old, new)
    print(f"OK: {old[:40]}")

# Inject t hooks into helper components
injections = [
    ("function AddressFields({ prefix, value, onChange,projectEditPermission }", "}) {\n  const t = useTranslations('projectSettingsPage');\n  const f = (field: string)"),
    ("function AddressFields({ prefix, value, onChange,projectEditPermission }: { prefix: string; value: any; onChange: (v: any) => void,projectEditPermission:boolean }) {\n  const f = (field: string)", 
     "function AddressFields({ prefix, value, onChange,projectEditPermission }: { prefix: string; value: any; onChange: (v: any) => void,projectEditPermission:boolean }) {\n  const t = useTranslations('projectSettingsPage');\n  const f = (field: string)"),
    ("function DeliveryForm({ value, onChange, onSave,projectEditPermission }", "}) {\n  const t = useTranslations('projectSettingsPage');\n  return ("),
    ("function DeliveryForm({ value, onChange, onSave,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void,projectEditPermission:boolean }) {\n  return (",
     "function DeliveryForm({ value, onChange, onSave,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void,projectEditPermission:boolean }) {\n  const t = useTranslations('projectSettingsPage');\n  return ("),
    ("function PreferencesForm({\n  value,\n  onChange,\n  projectEditPermission,\n  onSave,\n}: {\n  value: OnboardingData;\n  onChange: (v: OnboardingData) => void;\n  onSave: (p: any) => void;\n}) {\n  return (",
     "function PreferencesForm({\n  value,\n  onChange,\n  projectEditPermission,\n  onSave,\n}: {\n  value: OnboardingData;\n  onChange: (v: OnboardingData) => void;\n  onSave: (p: any) => void;\n}) {\n  const t = useTranslations('projectSettingsPage');\n  return ("),
    ("function TimelineForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {\n  // Format date",
     "function TimelineForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {\n  const t = useTranslations('projectSettingsPage');\n  // Format date"),
    ("function FinancialForm({ value, onChange, onSave,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {\n  const updateData",
     "function FinancialForm({ value, onChange, onSave,projectEditPermission }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {\n  const t = useTranslations('projectSettingsPage');\n  const updateData"),
]

for old, new in injections:
    if old in text and new not in text:
        text = text.replace(old, new, 1)
        print(f"INJECT: {old[:30]}")

PATH.write_text(text, encoding="utf-8")
print("Done.")
