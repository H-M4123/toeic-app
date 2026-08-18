import { GoogleGenAI, Type, Schema } from '@google/genai';
import { QuestionGroup } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: apiKey });

const questionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      context: { type: Type.STRING, description: "長文、会話スクリプト、またはリスニングのスクリプト。Part1,2,5の場合は空文字でも可。" },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "設問文。Part1,2の場合は空文字。" },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "選択肢。Part2は3つ、他は4つ。" },
            correctAnswerIndex: { type: Type.INTEGER, description: "正解のインデックス(0始まり)" },
            explanation: { type: Type.STRING, description: "日本語での詳しい解説" }
          },
          required: ["text", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
    required: ["context", "questions"]
  }
};

const getPromptForPart = (part: number, sets: number): string => {
  const base = `TOEIC Part ${part} の問題を ${sets} セット作成してください。英語学習者向けに、本番に近い難易度と形式で作成してください。解説は日本語で詳しく書いてください。`;
  switch(part) {
    case 1: return base + `\n各セットは1枚の写真を想定した問題です。contextに写真の状況（例: A man is reading a book in a park.）を英語で書き、questionsにはその写真に対する4つの音声選択肢（A,B,C,D）のテキストを書いてください。設問文(text)は空文字にしてください。`;
    case 2: return base + `\n各セットは1つの短い発話に対する応答問題です。contextに最初の発話を書き、questionsには3つの応答選択肢（A,B,C）のテキストを書いてください。設問文(text)は空文字にしてください。`;
    case 3: return base + `\n各セットは2〜3人の会話です。contextに会話のスクリプトを書き、questionsにはその会話に関する3つの設問を書いてください。`;
    case 4: return base + `\n各セットは1人のトーク（アナウンス等）です。contextにトークのスクリプトを書き、questionsにはそのトークに関する3つの設問を書いてください。`;
    case 5: return base + `\n各セットは1つの短文穴埋め問題です。contextは空文字にし、questionsのtextに空欄(____)を含む短文を書いてください。`;
    case 6: return base + `\n各セットは1つの長文穴埋め問題です。contextに4つの空欄(____)を含む長文を書き、questionsにはそれぞれの空欄に入る選択肢を4問分書いてください。`;
    case 7: return base + `\n各セットは1つの読解問題です。contextにEメールや記事などの長文を書き、questionsにはその長文に関する設問を2〜4問書いてください。`;
    default: return base;
  }
};

export const generateQuestions = async (part: number, sets: number): Promise<QuestionGroup[]> => {
  const prompt = getPromptForPart(part, sets);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema,
        temperature: 0.7,
      }
    });

    const rawData = JSON.parse(response.text.trim());
    
    // Add unique IDs and part info
    return rawData.map((group: any, groupIndex: number) => ({
      id: `p${part}-g${Date.now()}-${groupIndex}`,
      part,
      context: group.context || '',
      questions: group.questions.map((q: any, qIndex: number) => ({
        id: `p${part}-g${Date.now()}-${groupIndex}-q${qIndex}`,
        text: q.text || '',
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation
      }))
    }));
  } catch (error) {
    console.error(`Error generating questions for Part ${part}:`, error);
    throw error;
  }
};
