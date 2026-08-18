import React from 'react';
import { BookOpen, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <BookOpen size={28} />
          <h1 className="text-xl font-bold tracking-wide">TOEIC Master Pro</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-blue-600 rounded-full transition-colors"
          aria-label="Home"
        >
          <Home size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
