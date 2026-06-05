import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";

const NotFound = () => {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-semibold text-gray-900">{t("title")}</h1>
      <p className="text-lg mt-5">{t("description")}</p>
      <Link to="/" className="mt-4 text-blue-500">
        {t("backHome")}
      </Link>
    </div>
  );
};

export default NotFound;
