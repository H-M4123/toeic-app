import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Timer, Target, Award } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          AIが生成する無限のTOEIC問題で<br className="hidden sm:block" />スコアアップを目指そう
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          最新のAI技術を活用し、本番さながらの問題と詳細な解説を提供します。
          パート別の集中学習と、100問のハーフ模試で実力を測りましょう。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Learning Mode Card */}
        <div 
          onClick={() => navigate('/learning')}
          className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all transform hover:-translate-y-1 group"
        >
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <GraduationCap size={32} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">パート別学習モード</h3>
          <p className="text-gray-600 mb-6">
            Part 1からPart 7まで、苦手なパートを選んで集中的に学習します。
            1問解くごとに詳しい解説を確認でき、着実に理解を深められます。
          </p>
          <ul className="space-y-2 text-sm text-gray-500 mb-8">
            <li className="flex items-center gap-2"><Target size={16} className="text-green-500"/> 苦手分野の克服</li>
            <li className="flex items-center gap-2"><Target size={16} className="text-green-500"/> 即時フィードバック</li>
          </ul>
          <button className="w-full bg-blue-50 text-blue-700 font-semibold py-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            学習を始める
          </button>
        </div>

        {/* Exam Mode Card */}
        <div 
          onClick={() => navigate('/exam')}
          className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-red-500 cursor-pointer transition-all transform hover:-translate-y-1 group"
        >
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
            <Timer size={32} className="text-red-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">本番仕様モード (100問)</h3>
          <p className="text-gray-600 mb-6">
            全パートから構成される100問のハーフ模試に挑戦します。
            制限時間内に解き切るタイムマネジメント力を養いましょう。
          </p>
          <ul className="space-y-2 text-sm text-gray-500 mb-8">
            <li className="flex items-center gap-2"><Award size={16} className="text-orange-500"/> 本番さながらの緊張感</li>
            <li className="flex items-center gap-2"><Award size={16} className="text-orange-500"/> 総合スコアの算出</li>
          </ul>
          <button className="w-full bg-red-50 text-red-700 font-semibold py-3 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
            模試に挑戦する
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
