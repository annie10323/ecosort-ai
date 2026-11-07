import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CameraScanner } from './components/CameraScanner';
import { AnalysisModal } from './components/AnalysisModal';
import { GuideSection } from './components/GuideSection';
import { QuizSection } from './components/QuizSection';
import { ScanHistory } from './components/ScanHistory';
import { WasteAnalysisResult, ScanHistoryItem } from './types';
import { AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'ecosort_scan_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'camera' | 'guide' | 'quiz' | 'history'>('camera');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<WasteAnalysisResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History state loaded from localStorage
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
    return [];
  });

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Calculate total eco points
  const totalEcoPoints = history.reduce(
    (sum, item) => sum + (item.completedAt ? item.ecoPoints : 0),
    0
  );

  const handleAnalyze = async (imageDataUrl: string, sampleDescription?: string) => {
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setCurrentImage(imageDataUrl);

      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          userPrompt: sampleDescription,
          region: 'tw',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.result) {
        throw new Error(data.error || '無法辨識該物品，請嘗試更清晰或光線更充足的照片。');
      }

      const result: WasteAnalysisResult = data.result;
      const historyId = 'scan_' + Date.now();

      const newHistoryItem: ScanHistoryItem = {
        id: historyId,
        timestamp: Date.now(),
        imageUrl: imageDataUrl,
        result,
        ecoPoints: 50,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setCurrentHistoryId(historyId);
      setCurrentResult(result);
    } catch (err: any) {
      console.error('Classification error:', err);
      setErrorMessage(err?.message || '辨識失敗，請確認網路連線或換個角度重試。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompleteSorting = () => {
    if (!currentHistoryId) return;
    setHistory((prev) =>
      prev.map((item) =>
        item.id === currentHistoryId && !item.completedAt
          ? { ...item, completedAt: Date.now() }
          : item
      )
    );
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setCurrentImage(item.imageUrl);
    setCurrentResult(item.result);
    setCurrentHistoryId(item.id);
  };

  const handleClearHistory = () => {
    if (window.confirm('確定要清除所有辨識紀錄嗎？')) {
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
  };

  const isCurrentCompleted = Boolean(
    history.find((item) => item.id === currentHistoryId)?.completedAt
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setErrorMessage(null);
        }}
        ecoPoints={totalEcoPoints}
      />

      {/* Error Toast Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold text-xs"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col">
        {activeTab === 'camera' && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                AI 垃圾分類與減量分析
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                支援相簿照片直接選取分析或鏡頭即時掃描，AI 精準判斷分類去處與源頭減廢提案
              </p>
            </div>

            <CameraScanner onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        )}

        {activeTab === 'guide' && <GuideSection />}

        {activeTab === 'quiz' && <QuizSection />}

        {activeTab === 'history' && (
          <ScanHistory
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Modal Result Pop-up */}
      {currentResult && (
        <AnalysisModal
          result={currentResult}
          imageUrl={currentImage}
          isCompleted={isCurrentCompleted}
          onClose={() => setCurrentResult(null)}
          onCompleteSorting={handleCompleteSorting}
        />
      )}

      {/* Footer Info */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-600 dark:text-slate-300">
        <p>EcoSort AI • 遵循行政院環境保護署資源回收與源頭減量指引 • 讓垃圾變資源</p>
      </footer>
    </div>
  );
}
