import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, Layers, Filter, CheckCircle2, BookOpen } from 'lucide-react';
import { GUIDE_ITEMS } from '../data/guideData';
import { GuideItem, WasteCategory } from '../types';

export const GuideSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<GuideItem | null>(null);

  const categories = [
    { id: 'ALL', label: '全部物品' },
    { id: 'RECYCLABLE_PAPER_CONTAINER', label: '紙容器類' },
    { id: 'RECYCLABLE_PLASTIC', label: '塑膠回收' },
    { id: 'FOOD_WASTE_RAW', label: '生廚餘 (堆肥)' },
    { id: 'FOOD_WASTE_COOKED', label: '熟廚餘 (養豬)' },
    { id: 'HAZARDOUS_WASTE', label: '有害/電池' },
    { id: 'RECYCLABLE_GLASS', label: '玻璃類' },
    { id: 'RECYCLABLE_METAL', label: '金屬鐵鋁' },
    { id: 'GENERAL_WASTE', label: '一般垃圾' },
  ];

  const filteredItems = useMemo(() => {
    return GUIDE_ITEMS.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.preparation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-200 dark:border-amber-700';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'green':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700';
      case 'red':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-200 dark:border-rose-700';
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-bold tracking-widest text-emerald-100 uppercase">
            台灣與東亞資源分類權威指引
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">垃圾分類圖鑑與陷阱指南</h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          收錄最常讓人困惑的模糊物品（如紙餐盒、手搖杯封膜、大骨頭、發票等），掌握「清空、沖洗、拆解、壓扁」原則，不再怕丟錯被清潔隊退貨！
        </p>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋物品，如：手搖杯、便當盒、電池、骨頭、發票..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-800 placeholder-slate-400 text-sm font-medium shadow-md focus:outline-hidden focus:ring-4 focus:ring-emerald-300 transition-all"
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-600 dark:text-slate-300 flex-shrink-0 ml-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header with Title and Category Badge */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  {item.recyclingCode && (
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      標誌：{item.recyclingCode}
                    </span>
                  )}
                </div>
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border shadow-xs ${getBadgeColor(
                    item.binColor
                  )}`}
                >
                  {item.categoryName}
                </span>
              </div>

              {/* Preparation Steps */}
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                <span className="font-bold text-slate-800 dark:text-slate-200">處置方式：</span>
                {item.preparation}
              </div>

              {/* Trap Warning Alert */}
              {item.trapWarning && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">易錯陷阱：</span>
                    {item.trapWarning}
                  </div>
                </div>
              )}

              {/* Multi components tags */}
              {item.components && item.components.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    拆解部件：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.components.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Keyword tags */}
            <div className="mt-3 pt-2 flex flex-wrap gap-1">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            找不到符合「{searchTerm}」的指南項目
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
            }}
            className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            清除搜尋條件
          </button>
        </div>
      )}
    </div>
  );
};
