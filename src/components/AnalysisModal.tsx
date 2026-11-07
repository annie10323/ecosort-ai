import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Send,
  Layers,
  Recycle,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Flame,
  Droplets,
} from 'lucide-react';
import { WasteAnalysisResult } from '../types';
import { speakText, stopSpeaking, playSuccessChime } from '../utils/audio';

interface AnalysisModalProps {
  result: WasteAnalysisResult;
  imageUrl: string;
  onClose: () => void;
  onCompleteSorting: () => void;
  isCompleted?: boolean;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  result,
  imageUrl,
  onClose,
  onCompleteSorting,
  isCompleted = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [completed, setCompleted] = useState(isCompleted);

  // Follow-up chat state
  const [question, setQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  const getThemeColors = (color: string) => {
    switch (color) {
      case 'amber':
        return {
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-300',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
          gradient: 'from-amber-500 to-orange-500',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          lightBg: 'bg-yellow-50 dark:bg-yellow-950/40',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-300',
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200',
          gradient: 'from-yellow-500 to-amber-500',
        };
      case 'green':
        return {
          bg: 'bg-emerald-600',
          lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
          gradient: 'from-emerald-600 to-teal-600',
        };
      case 'red':
        return {
          bg: 'bg-rose-600',
          lightBg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-700 dark:text-rose-300',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
          gradient: 'from-rose-600 to-red-600',
        };
      case 'blue':
        return {
          bg: 'bg-blue-600',
          lightBg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
          gradient: 'from-blue-600 to-cyan-600',
        };
      default:
        return {
          bg: 'bg-slate-600',
          lightBg: 'bg-slate-100 dark:bg-slate-900',
          border: 'border-slate-300 dark:border-slate-700',
          text: 'text-slate-700 dark:text-slate-300',
          badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          gradient: 'from-slate-700 to-zinc-600',
        };
    }
  };

  const theme = getThemeColors(result.targetBinColor);

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const speechContent = `${result.itemName}。建議分類為：${result.categoryName}。${result.summary}。處理方式：${result.disposalSteps.join('、')}。`;
      setIsSpeaking(true);
      speakText(speechContent, () => setIsSpeaking(false));
    }
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleFinish = () => {
    setCompleted(true);
    playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onCompleteSorting();
  };

  const handleSendQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userQ = question.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setQuestion('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/chat-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: result.itemName,
          categoryName: result.categoryName,
          question: userQ,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: data.answer }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.error || '抱歉，暫時無法回答此問題，請稍候重試。' },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '網路連線異常，請稍後再試。' },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className={`p-5 sm:p-6 bg-gradient-to-r ${theme.gradient} text-white flex items-start justify-between relative`}>
          <div className="pr-10">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                AI 辨識結果
              </span>
              <span className="text-xs bg-black/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-medium">
                信心度 {Math.round(result.confidence * 100)}%
              </span>
              {result.recyclingCode && (
                <span className="text-xs bg-white text-slate-900 px-2 py-0.5 rounded-full font-bold shadow-sm">
                  {result.recyclingCode}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {result.itemName}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-0.5">
              {result.englishName}
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all active:scale-95"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Destination Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl ${theme.lightBg} border ${theme.border} flex items-center justify-between gap-4 shadow-sm`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl ${theme.bg} text-white flex items-center justify-center shadow-md font-bold text-lg flex-shrink-0`}>
                <Recycle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  正確丟棄分類
                </div>
                <div className={`text-xl sm:text-2xl font-black ${theme.text}`}>
                  {result.categoryName}
                </div>
              </div>
            </div>

            {/* Voice Narrate Button */}
            <button
              type="button"
              onClick={toggleSpeech}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  停止語音
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  語音播報
                </>
              )}
            </button>
          </div>

          {/* Scanned Image & One-sentence Summary */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <img
              src={imageUrl}
              alt={result.itemName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-md border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                關鍵丟棄摘要
              </div>
              <p className="text-slate-800 dark:text-slate-100 text-sm sm:text-base font-semibold leading-relaxed">
                {result.summary}
              </p>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 justify-center sm:justify-start">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                乾淨度標準：{result.cleanlinessRequirement}
              </div>
            </div>
          </div>

          {/* Multi-Component Breakdown Table (Crucial for items like drink cups or bento boxes) */}
          {result.componentsBreakdown && result.componentsBreakdown.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  各部件材質分解指引
                </h4>
                <span className="text-xs text-slate-600 dark:text-slate-300">多材質需分開處置</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.componentsBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {item.partName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item.material}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-600 dark:text-slate-300">丟棄目標：</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.targetBin}
                      </span>
                    </div>
                    {item.actionNote && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                        ※ {item.actionNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Disposal Steps Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                正確處置 5 步驟（點擊勾選標記完成）
              </h4>
              <span className="text-xs text-emerald-600 font-semibold">
                {checkedSteps.length} / {result.disposalSteps.length}
              </span>
            </div>

            <div className="space-y-2">
              {result.disposalSteps.map((step, idx) => {
                const isChecked = checkedSteps.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all border ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <span className={`text-sm ${isChecked ? 'line-through opacity-70' : 'font-medium'}`}>
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Common Mistakes Warning */}
          {result.commonMistakes && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">避開常見分類盲點：</span>
                <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                  {result.commonMistakes}
                </p>
              </div>
            </div>
          )}

          {/* Waste Reduction Tips Section (源頭減量建議) */}
          {result.wasteReductionTips && result.wasteReductionTips.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/90 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  🌱
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-teal-950 dark:text-teal-100">
                    如何從源頭減少該垃圾？（綠色生活減量方案）
                  </h4>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300">
                    源頭減廢比事後回收更有力量！試試以下日常替代做法：
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                {result.wasteReductionTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-2.5 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eco Impact Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
              🌍
            </div>
            <div>
              <span className="font-bold block mb-0.5">環保效益：</span>
              <p className="text-emerald-800 dark:text-emerald-300 leading-snug">
                {result.ecoImpact}
              </p>
            </div>
          </div>

          {/* Follow-up AI Assistant Q&A */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              對這個垃圾有特殊疑問？問問 AI
            </h4>

            {/* Quick suggested chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                '如果沾了油還能回收嗎？',
                '洗不乾淨的話該丟哪？',
                '這個可以當生廚餘嗎？',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuestion(chip)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat conversation list */}
            {chatMessages.length > 0 && (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] text-xs sm:text-sm px-3.5 py-2 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-600 shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSendQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="輸入您的疑問，例如：吸管若有塑膠套該怎麼丟？"
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                詢問
              </button>
            </form>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            返回掃描
          </button>

          <button
            type="button"
            onClick={handleFinish}
            disabled={completed}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              completed
                ? 'bg-slate-400 dark:bg-slate-700 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                已完成分類 (+50 點數)
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                我已正確丟棄！領取減碳點數
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
