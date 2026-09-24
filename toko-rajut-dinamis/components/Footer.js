import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2 text-xs text-center">
        <div className="flex items-center gap-2">
          <span className="font- text-white">Lyffa Rajut</span>
          <span>&copy; {new Date().getFullYear()} — Kerajinan Tangan</span>
          
        </div>
      </div>
    </footer>
  );
}