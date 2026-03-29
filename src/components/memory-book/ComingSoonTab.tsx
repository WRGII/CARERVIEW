import { Clock } from "lucide-react";

type Props = {
  title: string;
  description: string;
  phase: string;
};

export default function ComingSoonTab({ title, description, phase }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Clock className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-3">{description}</p>
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-500">
        Available in {phase}
      </span>
    </div>
  );
}
