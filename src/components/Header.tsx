import React from 'react';
import { Camera, BookOpen, Award, History, Recycle, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'camera' | 'guide' | 'quiz' | 'history';
  onTabChange: (tab: 'camera' | 'guide' | 'quiz' | 'history') => void;
  ecoPoints: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, ecoPoints }) => {
  const tabs = [
    { id: 'camera', label: '鏡頭掃描', icon: Camera },
    { id: 'guide', label: '分類圖鑑', icon: BookOpen },
    { id: 'quiz', label: '環保測驗', icon: Award },
    { id: 'history', label: '辨識紀錄', icon: History },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Logo Branding */}
        <div
          onClick={() => onTabChange('camera')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
            <Recycle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                EcoSort
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-emerald-500 text-white leading-none">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium -mt-0.5">
              智慧垃圾分類辨識助手
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Eco Points Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
            {ecoPoints}
          </span>
          <span className="text-[10px] text-emerald-600/80 font-bold">點數</span>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="sm:hidden flex items-center justify-around border-t border-slate-200/60 dark:border-slate-800 px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 font-medium'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
