import React, { useState, useEffect } from 'react';
import { PART_DESCRIPTIONS } from '../constants';
import { generateQuestions } from '../services/geminiService';
import { QuestionGroup } from '../types';
import QuestionGroupView from './QuestionGroupView';
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react';

const LearningMode: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionGroup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleStartPart = async (part: number) => {
    setSelectedPart(part);
    setLoading(true);
    setError(null);
    try {
      // Generate 3 sets for learning mode
      const generated = await generateQuestions(part, 3);
      setQuestions(generated);
      setCurrentIndex(0);
    } catch (err) {
      setError("問題の生成に失敗しました。もう一度お試しください。");
      setSelectedPart(null);
    } finally {
      setLoading(false);
    }
  };

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
    } else {
      // Finished all questions in this session
      setSelectedPart(null);
      setQuestions([]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">AIが問題を生成中...</h3>
        <p className="text-gray-500 mt-2">Part {selectedPart} の問題を作成しています。数秒お待ちください。</p>
      </div>
    );
  }

  if (selectedPart && questions.length > 0) {
    const currentGroup = questions[currentIndex];
    const allAnswered = currentGroup.questions.every(q => q.userAnswer !== undefined);
    const isLast = currentIndex === questions.length - 1;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Part {selectedPart} 学習モード</h2>
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        <QuestionGroupView 
          group={currentGroup} 
          mode="learning" 
          onAnswerUpdate={handleAnswerUpdate} 
        />

        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            disabled={!allAnswered}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
              allAnswered 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLast ? (
              <>終了してパート選択へ戻る <CheckCircle size={20} /></>
            ) : (
              <>次の問題へ <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">パート別学習</h2>
      <p className="text-gray-600 text-center mb-10">学習したいパートを選択してください。AIが毎回新しい問題を生成します。</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PART_DESCRIPTIONS.map((part) => (
          <div 
            key={part.part}
            onClick={() => handleStartPart(part.part)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {part.title}
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                Part {part.part}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {part.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningMode;
