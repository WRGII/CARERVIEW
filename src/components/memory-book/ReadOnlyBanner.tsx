import { Eye } from "lucide-react";

export default function ReadOnlyBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
      <Eye className="w-4 h-4 flex-shrink-0" />
      <span>You have view access to this section. Only team owners can make changes.</span>
    </div>
  );
}
