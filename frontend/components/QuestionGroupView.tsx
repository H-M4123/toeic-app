import React, { useState, useEffect } from 'react';
import { QuestionGroup } from '../types';
import { Volume2, Square, CheckCircle2, XCircle } from 'lucide-react';
import { speakText, stopSpeech } from '../services/speechService';

interface Props {
  group: QuestionGroup;
  mode: 'learning' | 'exam' | 'result';
  onAnswerUpdate: (groupId: string, questionId: string, answerIndex: number) => void;
}

const QuestionGroupView: React.FC<Props> = ({ group, mode, onAnswerUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isListeningPart = group.part >= 1 && group.part <= 4;
  const isReadingPart = group.part >= 6 && group.part <= 7;

  // Stop speech when component unmounts or group changes
  useEffect(() => {
    return () => stopSpeech();
  }, [group.id]);

  const handlePlayAudio = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      // Construct text to read
      let textToRead = group.context;
      if (group.part === 1 || group.part === 2) {
        // For Part 1 & 2, read the context and the options
        const optionsText = group.questions[0].options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('. ');
        textToRead = `${group.context}. ${optionsText}`;
      }
      
      speakText(textToRead);
      setIsPlaying(true);
      
      // Simple timeout to reset playing state (not perfect, but works for UI feedback)
      setTimeout(() => setIsPlaying(false), textToRead.length * 100);
    }
  };

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (mode === 'result') return;
    onAnswerUpdate(group.id, questionId, optionIndex);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
        <span className="font-semibold text-gray-700">Part {group.part}</span>
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-8">
        {/* Left side: Context (Image, Audio, or Text) */}
        {(group.context || group.part === 1) && (
          <div className="md:w-1/2 flex flex-col gap-4">
            {group.part === 1 && (
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex justify-center">
                <img 
                  src={`https://picsum.photos/seed/${group.id}/500/350`} 
                  alt="TOEIC Part 1" 
                  className="max-w-full h-auto object-cover"
                />
              </div>
            )}

            {isListeningPart && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <button 
                  onClick={handlePlayAudio}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full justify-center"
                >
                  {isPlaying ? <Square size={20} /> : <Volume2 size={20} />}
                  {isPlaying ? '停止' : '音声を再生'}
                </button>
                {mode === 'result' && (
                  <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                    <p className="font-semibold mb-1">スクリプト:</p>
                    {group.context}
                  </div>
                )}
              </div>
            )}

            {isReadingPart && group.context && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
                {group.context}
              </div>
            )}
          </div>
        )}

        {/* Right side: Questions */}
        <div className={`flex flex-col gap-8 ${(!group.context && group.part !== 1) ? 'w-full' : 'md:w-1/2'}`}>
          {group.questions.map((q, qIndex) => {
            const isAnswered = q.userAnswer !== undefined;
            const isCorrect = q.userAnswer === q.correctAnswerIndex;
            const showResult = mode === 'result' || (mode === 'learning' && isAnswered);

            return (
              <div key={q.id} className="flex flex-col gap-3">
                {q.text && (
                  <h4 className="text-lg font-medium text-gray-900">
                    {group.questions.length > 1 ? `${qIndex + 1}. ` : ''}{q.text}
                  </h4>
                )}
                
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = q.userAnswer === optIndex;
                    const isActualCorrect = q.correctAnswerIndex === optIndex;
                    
                    let optionClass = "border-gray-200 hover:bg-gray-50 text-gray-700";
                    let icon = null;

                    if (showResult) {
                      if (isActualCorrect) {
                        optionClass = "bg-green-50 border-green-500 text-green-800 font-medium";
                        icon = <CheckCircle2 size={20} className="text-green-600" />;
                      } else if (isSelected) {
                        optionClass = "bg-red-50 border-red-500 text-red-800";
                        icon = <XCircle size={20} className="text-red-600" />;
                      } else {
                        optionClass = "border-gray-200 opacity-50";
                      }
                    } else if (isSelected) {
                      optionClass = "bg-blue-50 border-blue-500 text-blue-800";
                    }

                    return (
                      <div 
                        key={optIndex}
                        onClick={() => handleOptionSelect(q.id, optIndex)}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${optionClass} ${mode === 'result' ? 'cursor-default' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold w-6 h-6 flex items-center justify-center rounded-full bg-white border border-current text-sm">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                {showResult && (
                  <div className={`mt-2 p-4 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                    <p className="font-bold mb-1">解説:</p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionGroupView;
