import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, XCircle, RefreshCw, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { playSuccessChime } from '../utils/audio';

export const QuizSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      playSuccessChime();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Quiz Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-700">
        {!isFinished ? (
          <div>
            {/* Top Progress bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                環保知識隨堂測驗
              </span>
              <span>
                第 {currentIndex + 1} 題 / 共 {QUIZ_QUESTIONS.length} 題
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 mb-2">
                {currentQuestion.categoryName}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => {
                let stateStyles = 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 bg-white dark:bg-slate-800';
                if (isAnswered) {
                  if (idx === currentQuestion.correctIndex) {
                    stateStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                  } else if (idx === selectedOption) {
                    stateStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                  } else {
                    stateStyles = 'opacity-50 border-slate-200 dark:border-slate-700';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${stateStyles}`}
                  >
                    <span className="text-sm font-semibold">{option}</span>
                    {isAnswered && idx === currentQuestion.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 animate-in fade-in">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  💡 環保專家解析：
                </span>
                <p className="leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                {currentIndex < QUIZ_QUESTIONS.length - 1 ? (
                  <>
                    下一題 <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    查看總成績 <Award className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          /* Finished Result View */
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-4 shadow-lg">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              測驗完成！
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              你在 {QUIZ_QUESTIONS.length} 題中答對了{' '}
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {score}
              </span>{' '}
              題
            </p>

            {/* Achievement Badge */}
            <div className="inline-block p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 mb-8 max-w-sm">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest mb-1">
                榮獲徽章稱號
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {score === QUIZ_QUESTIONS.length
                  ? '🌟 零廢棄綠色宗師'
                  : score >= 4
                  ? '🌿 分類減塑達人'
                  : '🌱 環保萌新見習生'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {score === QUIZ_QUESTIONS.length
                  ? '太強了！連最容易被誤會的紙容器與大骨頭都精準分類！'
                  : score >= 4
                  ? '觀念非常扎實，日常生活分類完全難不倒你！'
                  : '多看幾次圖鑑指南，下次一定能拿滿分！'}
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                重新挑戰測驗
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
