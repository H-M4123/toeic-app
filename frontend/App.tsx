import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import LearningMode from './components/LearningMode';
import ExamMode from './components/ExamMode';
import ResultView from './components/ResultView';
import { ExamResult } from './types';

const App: React.FC = () => {
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learning" element={<LearningMode />} />
            <Route 
              path="/exam" 
              element={
                <ExamMode 
                  onFinish={(result) => {
                    setExamResult(result);
                    // Use window.location to navigate to result to avoid passing navigate prop deeply
                    window.location.hash = '#/result';
                  }} 
                />
              } 
            />
            <Route 
              path="/result" 
              element={
                examResult ? <ResultView result={examResult} /> : <Navigate to="/" replace />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
          <p>© {new Date().getFullYear()} TOEIC Master Pro. Powered by Gemini API.</p>
          <p className="mt-1 text-xs">※このアプリは学習目的のデモであり、実際のTOEICテストとは関係ありません。</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
