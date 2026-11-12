import React, { useState } from 'react';
import { Medication, MEDICINE_FORMS } from '../types/medication';
import { useLanguage } from '../utils/translations';
import { AlertTriangle, PlusCircle, Check, X } from 'lucide-react';

interface LowStockAlertBannerProps {
  lowStockMeds: Medication[];
  onQuickRefill: (medId: string, addedCount: number) => void;
  onEditMedication: (med: Medication) => void;
}

export const LowStockAlertBanner: React.FC<LowStockAlertBannerProps> = ({
  lowStockMeds,
  onQuickRefill,
  onEditMedication,
}) => {
  const { t, language } = useLanguage();
  const [refillInputMedId, setRefillInputMedId] = useState<string | null>(null);
  const [refillAmount, setRefillAmount] = useState<number>(30);
  const [isDismissed, setIsDismissed] = useState(false);

  if (lowStockMeds.length === 0 || isDismissed) return null;

  const handleApplyRefill = (medId: string) => {
    if (refillAmount > 0) {
      onQuickRefill(medId, refillAmount);
      setRefillInputMedId(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30 animate-pulse">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                {t.stockLowAlert}
              </h3>
              <span className="text-[11px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                {lowStockMeds.length}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="self-end sm:self-auto p-1.5 rounded-xl text-amber-600 hover:text-amber-900 hover:bg-amber-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List of Low Stock Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {lowStockMeds.map((med) => {
          const currentCount = med.stockCount ?? 0;
          const isCritical = currentCount <= 2;
          const isRefillingThis = refillInputMedId === med.id;

          return (
            <div
              key={med.id}
              className={`p-3.5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-300 shadow-xs'
                  : 'border-amber-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-extrabold text-sm text-slate-900 leading-tight">
                    {med.name}
                  </div>
                </div>

                <div className="mt-2 text-xs flex items-center justify-between text-slate-600">
                  <span>{t.stockLabel}</span>
                  <span className="font-bold font-mono text-rose-600 text-sm tabular-nums">
                    {currentCount} {t.stockRemaining}
                  </span>
                </div>
              </div>

              {/* Refill action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                {isRefillingThis ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={refillAmount}
                        onChange={(e) => setRefillAmount(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                        placeholder="30"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApplyRefill(med.id)}
                        className="flex-1 py-1 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.saveChanges}</span>
                      </button>
                      <button
                        onClick={() => setRefillInputMedId(null)}
                        className="py-1 px-2 rounded-lg border border-slate-200 text-slate-500 text-[11px] hover:bg-slate-50"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRefillInputMedId(med.id);
                        setRefillAmount(30);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+30</span>
                    </button>
                    <button
                      onClick={() => onEditMedication(med)}
                      className="py-1.5 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                    >
                      {t.edit}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
