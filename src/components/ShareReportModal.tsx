import React, { useState } from 'react';
import {
  Share2,
  X,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Send,
  ExternalLink,
  HeartPulse,
  UserCheck,
  Smartphone,
} from 'lucide-react';
import { useLanguage } from '../utils/translations';

export interface ShareReportData {
  patientName?: string;
  overallRate: number;
  totalTaken: number;
  totalScheduled: number;
  perfectDaysCount: number;
  statusTone: string;
  startDateStr: string;
  endDateStr: string;
  medicationsSummary: { name: string; time: string; timeSlotAr: string }[];
  dailyBreakdown: { dayLabel: string; dateStr: string; rate: number; taken: number; total: number }[];
}

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ShareReportData;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
}) => {
  const { t, language } = useLanguage();
  const [targetType, setTargetType] = useState<'doctor' | 'family'>('doctor');
  const [recipientName, setRecipientName] = useState(language === 'ar' ? 'د. الطبيب المعالج' : 'Doctor');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const shareableUrl = `${currentUrl}#adherence`;

  const fullReportText = language === 'ar'
    ? `📋 *تقرير الالتزام بمواعيد الأدوية - تطبيق دوائي*
إلى: ${recipientName}

🗓️ الفترة: من ${reportData.startDateStr} إلى ${reportData.endDateStr}
📊 نسبة الالتزام الإجمالية: ${reportData.overallRate}% (${reportData.statusTone})
💊 الجرعات المتناولة: ${reportData.totalTaken} من أصل ${reportData.totalScheduled} جرعة
⭐ أيام الالتزام التام (100%): ${reportData.perfectDaysCount} من 7 أيام

💊 قائمة الأدوية الحالية:
${reportData.medicationsSummary.map((m) => `• ${m.name} - موعد: ${m.time}`).join('\n')}
${customNote ? `\n📝 ملاحظة إضافية: ${customNote}` : ''}

🔗 الرابط: ${shareableUrl}`
    : `📋 *Medication Adherence Report - Dawaa App*
To: ${recipientName}

🗓️ Period: ${reportData.startDateStr} to ${reportData.endDateStr}
📊 Overall Adherence Rate: ${reportData.overallRate}% (${reportData.statusTone})
💊 Doses Taken: ${reportData.totalTaken} of ${reportData.totalScheduled}
⭐ Perfect Days (100%): ${reportData.perfectDaysCount} of 7 days

💊 Medications:
${reportData.medicationsSummary.map((m) => `• ${m.name} - Time: ${m.time}`).join('\n')}
${customNote ? `\n📝 Note: ${customNote}` : ''}

🔗 Link: ${shareableUrl}`;

  const smsText = `${t.shareReportTitle}: ${reportData.overallRate}% - ${reportData.totalTaken}/${reportData.totalScheduled} doses. ${shareableUrl}`;
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  const handleSendSMS = () => {
    const encodedSMS = encodeURIComponent(smsText);
    const smsHref = cleanPhone ? `sms:${cleanPhone}?body=${encodedSMS}` : `sms:?body=${encodedSMS}`;
    window.location.href = smsHref;
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(fullReportText);
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone.replace('+', '')}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullReportText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                {t.shareReportTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg font-mono">
                {reportData.overallRate}%
              </div>
              <div>
                <div className="text-xs text-teal-800 font-semibold">{t.overallAdherence}</div>
                <div className="text-sm font-bold text-slate-900">
                  {reportData.statusTone} · {reportData.totalTaken} {t.dosesOf} {reportData.totalScheduled}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSendSMS}
                className="p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm shadow-teal-600/20 transition-all active:scale-[0.99]"
              >
                <Smartphone className="w-4 h-4" />
                <span>SMS</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.99]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{t.copiedToast}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.copyReport}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
