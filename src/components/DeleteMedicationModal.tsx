import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Medication } from '../types/medication';
import { useLanguage } from '../utils/translations';

interface DeleteMedicationModalProps {
  isOpen: boolean;
  medication: Medication | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteMedicationModal: React.FC<DeleteMedicationModalProps> = ({
  isOpen,
  medication,
  onConfirm,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  if (!isOpen || !medication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <Trash2 className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900">
              {t.deleteTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t.deleteConfirmDesc}
            </p>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Medication snippet */}
        <div className="px-6 py-3 mx-6 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4">
          <div className="font-extrabold text-sm text-slate-900">{medication.name}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>{t.dosageLabel} <strong className="text-slate-700">{medication.dosage}</strong></span>
            <span>·</span>
            <span>{t.timeLabel} <strong className="font-mono text-slate-700" dir="ltr">{medication.time}</strong></span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs md:text-sm font-bold transition-colors"
          >
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.confirmDelete}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
