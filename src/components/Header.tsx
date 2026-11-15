import React from 'react';
import { Pill, Plus, Music, Calendar, Clock, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '../utils/translations';

interface HeaderProps {
  currentTab: 'today' | 'weekly' | 'adherence' | 'ringtones';
  onSelectTab: (tab: 'today' | 'weekly' | 'adherence' | 'ringtones') => void;
  onOpenAddModal: () => void;
  currentTimeString: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  currentTimeString,
}) => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              {t.appName}
            </span>
            <span className="hidden sm:block text-[10px] font-semibold text-teal-700 whitespace-nowrap truncate">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links with distinct functional colors */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-600">
          {/* Tab 1: Today Doses */}
          <button
            onClick={() => onSelectTab('today')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'today'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Clock className={`w-4 h-4 ${currentTab === 'today' ? 'text-white' : 'text-blue-600'}`} />
            <span>{t.tabToday}</span>
          </button>

          {/* Tab 2: Weekly Schedule */}
          <button
            onClick={() => onSelectTab('weekly')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'weekly'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Calendar className={`w-4 h-4 ${currentTab === 'weekly' ? 'text-white' : 'text-purple-600'}`} />
            <span>{t.tabWeekly}</span>
          </button>

          {/* Tab 3: Adherence Report */}
          <button
            onClick={() => onSelectTab('adherence')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'adherence'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${currentTab === 'adherence' ? 'text-white' : 'text-emerald-600'}`} />
            <span>{t.tabAdherence}</span>
          </button>

          {/* Tab 4: Sound Alerts */}
          <button
            onClick={() => onSelectTab('ringtones')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'ringtones'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Music className={`w-4 h-4 ${currentTab === 'ringtones' ? 'text-white' : 'text-amber-600'}`} />
            <span>{t.tabRingtones}</span>
          </button>
        </nav>

        {/* Zone 3: Clock, Language Switcher, & Add Action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold tabular-nums border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span dir="ltr">{currentTimeString}</span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-3 sm:px-4 py-2 text-xs md:text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25 active:scale-95 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addMedication}</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white px-2 py-1.5 text-xs font-bold">
        <button
          onClick={() => onSelectTab('today')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            currentTab === 'today' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-600" />
          <span>{t.tabTodayMobile}</span>
        </button>

        <button
          onClick={() => onSelectTab('weekly')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            currentTab === 'weekly' ? 'bg-purple-50 text-purple-700' : 'text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>{t.tabWeeklyMobile}</span>
        </button>

        <button
          onClick={() => onSelectTab('adherence')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            currentTab === 'adherence' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{t.tabAdherenceMobile}</span>
        </button>

        <button
          onClick={() => onSelectTab('ringtones')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            currentTab === 'ringtones' ? 'bg-amber-50 text-amber-700' : 'text-slate-600'
          }`}
        >
          <Music className="w-4 h-4 text-amber-600" />
          <span>{t.tabRingtonesMobile}</span>
        </button>
      </div>
    </header>
  );
};
