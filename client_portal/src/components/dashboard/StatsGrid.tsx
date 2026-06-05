import useUser from "@/hooks/userUser";
import { ViewCurrencySymbol } from "../ViewCurrencySymbol";
import { useTranslations } from "next-intl";

export function StatsGrid({ project }) {
  const { project: projectData } = useUser();
  const t = useTranslations("dashboard");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-banknote-arrow-up-icon lucide-banknote-arrow-up"
          >
            <path d="M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
            <path d="M18 12h.01" />
            <path d="M19 22v-6" />
            <path d="m22 19-3-3-3 3" />
            <path d="M6 12h.01" />
            <circle cx="12" cy="12" r="2" />
          </svg>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600">{t("totalPaid")}</p>
            <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">
              <ViewCurrencySymbol code={projectData?.currency || "USD"} />
              {project?.total_paid_invoice?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }) || 0}
            </p>
            <p className="text-xs text-gray-500">{t("totalPaidSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-banknote-arrow-down-icon lucide-banknote-arrow-down"
          >
            <path d="M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
            <path d="m16 19 3 3 3-3" />
            <path d="M18 12h.01" />
            <path d="M19 16v6" />
            <path d="M6 12h.01" />
            <circle cx="12" cy="12" r="2" />
          </svg>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600">{t("totalDue")}</p>
            <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">
              <ViewCurrencySymbol code={projectData?.currency || "USD"} />
              {project?.total_due_invoice?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }) || 0}
            </p>
            <p className="text-xs text-gray-500">{t("totalDueSubtitle")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
