import React from "react";
import { LockKeyhole } from "lucide-react";

type Props = {
  title: string;
  description: string;
  isOwner: boolean;
  ownerAction?: React.ReactNode;
};

export default function SectionEmptyState({ title, description, isOwner, ownerAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <LockKeyhole className="w-5 h-5 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{description}</p>
      {isOwner && ownerAction}
    </div>
  );
}
