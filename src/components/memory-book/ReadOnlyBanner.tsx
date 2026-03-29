import { Eye } from "lucide-react";
import { useLocale } from "../../i18n/LocaleContext";

export default function ReadOnlyBanner() {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
      <Eye className="w-4 h-4 flex-shrink-0" />
      <span>{t("memory_book.readonly_notice")}</span>
    </div>
  );
}
