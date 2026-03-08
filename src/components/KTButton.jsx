import React from 'react';
import { BookOpen } from 'lucide-react';

const KTButton = ({ onClick, disabled, selectedFile }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
        disabled
          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
      }`}
      title={selectedFile ? 'Generate KT for this file' : 'Generate KT for entire repository'}
    >
      <BookOpen className="w-4 h-4" />
      <span className="hidden md:inline">KT Document</span>
    </button>
  );
};

export default KTButton;