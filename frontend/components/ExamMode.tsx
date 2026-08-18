import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXAM_CONFIG } from '../constants';
import { generateQuestions } from '../services/geminiService';
import { QuestionGroup, ExamResult } from '../types';
import QuestionGroupView from './QuestionGroupView';
import { Loader2, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  onFinish: (result: ExamResult) => void;
}

const EXAM_TIME_SECONDS = 60 * 60; // 60 minutes for half test

const ExamMode: React.FC<Props> = ({ onFinish }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<QuestionGroup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExam = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    let completed = 0;
    const promises = EXAM_CONFIG.map(async (config) => {
      try {
        const q = await generateQuestions(config.part, config.sets);
        completed++;
        setProgress(Math.round((completed / EXAM_CONFIG.length) * 100));
        return q;
      } catch (err) {
        console.error(`Failed to generate Part ${config.part}`, err);
        completed++;
        setProgress(Math.round((completed / EXAM_CONFIG.length) * 100));
        return []; // Return empty array on failure to not break Promise.all
      }
    });

    try {
      const results = await Promise.all(promises);
      const allQuestions = results.flat();
      
      if (allQuestions.length === 0) {
        throw new Error("問題の生成に全て失敗しました。");
      }
      
      // Sort by part
      allQuestions.sort((a, b) => a.part - b.part);
      
      setQuestions(allQuestions);
      setIsStarted(true);
    } catch (err) {
      setError("模試の生成中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const finishExam = useCallback(() => {
    let totalQ = 0;
    let correctQ = 0;

    questions.forEach(group => {
      group.questions.forEach(q => {
        totalQ++;
        if (q.userAnswer === q.correctAnswerIndex) {
          correctQ++;
        }
      });
    });

    onFinish({
      groups: questions,
      totalQuestions: totalQ,
      correctAnswers: correctQ,
      timeSpentSeconds: EXAM_TIME_SECONDS - timeLeft
    });
  }, [questions, timeLeft, onFinish]);

  useEffect(() => {
    let timer: number;
    if (isStarted && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, finishExam]);

  const handleAnswerUpdate = (groupId: string, questionId: string, answerIndex: number) => {
    setQuestions(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        questions: g.questions.map(q => 
          q.id === questionId ? { ...q, userAnswer: answerIndex } : q
        )
      };
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      if (window.confirm("テストを終了して採点しますか？未解答の問題は不正解となります。")) {
        finishExam();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isStarted && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">本番仕様モード (ハーフ模試)</h2>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8 text-left">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" /> 注意事項
          </h3>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>AIが全パートから約100問を動的に生成します。生成には数十秒かかります。</li>
            <li>制限時間は <strong>60分</strong> です。時間が来ると自動的に終了します。</li>
            <li>途中で解説は表示されません。終了後にまとめて確認できます。</li>
            <li>リスニング問題の音声は、各問題の「再生」ボタンを押して聞いてください。</li>
          </ul>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button 
          onClick={generateExam}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transition-transform transform hover:scale-105"
        >
          模試を生成して開始する
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4">
        <Loader2 size={64} className="text-red-600 animate-spin mb-6" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">模試を生成中...</h3>
        <p className="text-gray-500 mb-8 text-center">
          AIが100問のオリジナル問題を作成しています。<br/>この処理には少し時間がかかります。
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
          <div 
            className="bg-red-600 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm font-bold text-gray-600">{progress}% 完了</p>
      </div>
    );
  }

  if (questions.length > 0) {
    const currentGroup = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    // Calculate total questions answered
    let answeredCount = 0;
    let totalCount = 0;
    questions.forEach(g => {
      g.questions.forEach(q => {
        totalCount++;
        if (q.userAnswer !== undefined) answeredCount++;
      });
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Sticky Header for Exam */}
        <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-sm py-4 border-b border-gray-200 mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-gray-700">
              Group {currentIndex + 1} / {questions.length}
            </div>
            <div className="text-sm text-gray-500">
              解答済み: {answeredCount} / {totalCount} 問
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
            <Clock size={24} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <QuestionGroupView 
          group={currentGroup} 
          mode="exam" 
          onAnswerUpdate={handleAnswerUpdate} 
        />

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            前の問題
          </button>
          <button
            onClick={handleNext}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-colors ${
              isLast ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLast ? 'テスト終了' : '次の問題'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ExamMode;
