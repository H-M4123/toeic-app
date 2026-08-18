import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamResult } from '../types';
import QuestionGroupView from './QuestionGroupView';
import { Trophy, Clock, Target, RotateCcw } from 'lucide-react';

interface Props {
  result: ExamResult;
}

const ResultView: React.FC<Props> = ({ result }) => {
  const navigate = useNavigate();
  
  const scorePercentage = Math.round((result.correctAnswers / result.totalQuestions) * 100) || 0;
  
  // Calculate estimated TOEIC score (very rough estimation)
  // Assuming 100 questions = max 495 points (half test)
  const estimatedScore = Math.round((result.correctAnswers / result.totalQuestions) * 495);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分${s}秒`;
  };

  // Calculate part-by-part stats
  const partStats = Array.from({ length: 7 }, (_, i) => i + 1).map(partNum => {
    let total = 0;
    let correct = 0;
    result.groups.filter(g => g.part === partNum).forEach(g => {
      g.questions.forEach(q => {
        total++;
        if (q.userAnswer === q.correctAnswerIndex) correct++;
      });
    });
    return { part: partNum, total, correct, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">テスト結果</h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
            <Target size={40} className="text-blue-500 mb-3" />
            <p className="text-gray-500 font-medium mb-1">正答率</p>
            <p className="text-4xl font-extrabold text-gray-900">{scorePercentage}<span className="text-2xl text-gray-500">%</span></p>
            <p className="text-sm text-gray-500 mt-2">{result.correctAnswers} / {result.totalQuestions} 問</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-sm border border-orange-200 p-6 flex flex-col items-center justify-center transform scale-105 z-10">
            <Trophy size={48} className="text-orange-500 mb-3" />
            <p className="text-orange-800 font-medium mb-1">予想スコア (換算)</p>
            <p className="text-5xl font-extrabold text-orange-600">{estimatedScore}</p>
            <p className="text-xs text-orange-600/70 mt-2">※ハーフ模試としての概算です</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
            <Clock size={40} className="text-green-500 mb-3" />
            <p className="text-gray-500 font-medium mb-1">解答時間</p>
            <p className="text-3xl font-extrabold text-gray-900">{formatTime(result.timeSpentSeconds)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">パート別正答率</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {partStats.map(stat => (
            <div key={stat.part} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-bold text-gray-700 mb-2">Part {stat.part}</span>
              <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-white border-4 border-gray-100">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100" />
                  <circle 
                    cx="28" cy="28" r="28" fill="none" stroke="currentColor" strokeWidth="4" 
                    className={stat.percentage >= 80 ? 'text-green-500' : stat.percentage >= 50 ? 'text-blue-500' : 'text-red-500'}
                    strokeDasharray={`${stat.percentage * 1.75} 175`} 
                  />
                </svg>
                <span className="text-sm font-bold z-10">{stat.percentage}%</span>
              </div>
              <span className="text-xs text-gray-500 mt-2">{stat.correct}/{stat.total}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors"
        >
          <RotateCcw size={24} />
          ホームに戻る
        </button>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-4">詳細な解説</h3>
        {result.groups.map((group, index) => (
          <div key={group.id} className="relative">
            <div className="absolute -left-4 top-4 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold z-10 shadow-md">
              {index + 1}
            </div>
            <div className="pl-6">
              <QuestionGroupView 
                group={group} 
                mode="result" 
                onAnswerUpdate={() => {}} 
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-12 pb-12">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-blue-600 font-medium hover:underline"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  );
};

export default ResultView;
