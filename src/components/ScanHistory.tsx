import React from 'react';
import { History, Trash2, ArrowUpRight, Award, Leaf, Recycle, Clock } from 'lucide-react';
import { ScanHistoryItem } from '../types';

interface ScanHistoryProps {
  history: ScanHistoryItem[];
  onSelectHistoryItem: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const totalPoints = history.reduce((acc, cur) => acc + (cur.completedAt ? cur.ecoPoints : 0), 0);
  const totalSorted = history.filter((h) => h.completedAt).length;
  const estimatedCo2Saved = (totalSorted * 0.085).toFixed(2); // roughly 85g CO2 per correctly sorted item

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Eco Dashboard Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-200">累積減碳效益</span>
            <Leaf className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="text-3xl font-black">{estimatedCo2Saved} kg</div>
          <span className="text-xs text-emerald-100 mt-1 block">
            減少之等效溫室氣體排放
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">成功正確分類</span>
            <Recycle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalSorted} <span className="text-sm font-normal text-slate-600 dark:text-slate-300">/ {history.length} 件</span>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 block">
            達成率 {history.length > 0 ? Math.round((totalSorted / history.length) * 100) : 0}%
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">地球綠點數</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500">{totalPoints} pt</div>
          <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 block">
            每完成分類 +50 點
          </span>
        </div>
      </div>

      {/* History List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          掃描辨識歷程記錄
        </h3>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清除紀錄
          </button>
        )}
      </div>

      {/* History Items Cards */}
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleString('zh-TW', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.imageUrl}
                    alt={item.result.itemName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.result.itemName}
                      </span>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {item.result.categoryName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {item.result.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <Clock className="w-3 h-3" />
                      <span>{dateStr}</span>
                      {item.completedAt && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          • 已完成丟棄 (+{item.ecoPoints} pt)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400 hover:text-emerald-500">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mb-3">
            <History className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            尚無掃描紀錄
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-4">
            開啟鏡頭拍下任何垃圾，或點選快速範例，AI 就能為您提供最精確的分類建議與減碳回饋！
          </p>
        </div>
      )}
    </div>
  );
};
