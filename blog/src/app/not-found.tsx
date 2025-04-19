'use client';

import { useEffect, useState } from 'react';

export default function NotFoundPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] text-black dark:bg-[#1e1e1e] dark:text-white font-[Fira_Sans]">
      <div className="flex flex-col items-center gap-8 text-center px-4">
        {/* Animated Eyes */}
        <div className="flex gap-2">
          <div className="w-20 h-20 bg-yellow-400 rounded-full grid place-items-center">
            <div className="w-7 h-7 bg-black  rounded-full animate-[eyeMove_2s_ease-in-out_infinite]" />
          </div>
          <div className="w-20 h-20 bg-yellow-400 rounded-full grid place-items-center">
            <div className="w-7 h-7 bg-black  rounded-full animate-[eyeMoveReverse_2s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Error Heading */}
        <div>
          <h1 className="text-yellow-400 text-3xl sm:text-4xl font-medium capitalize">
            Looks like you're lost
          </h1>
          <p className="text-lg sm:text-xl font-light mt-2">404 error</p>
        </div>

        {/* Back Button */}
        <a
          href="/"
          className="border border-yellow-400 text-inherit text-base sm:text-lg font-light px-6 py-3 rounded-xl shadow-md hover:shadow-none hover:bg-yellow-400 hover:text-white transition-all duration-300 capitalize"
          aria-label="back to home"
          title="back to home"
        >
          back to home
        </a>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-10 right-10 bg-transparent text-yellow-400 text-2xl sm:text-3xl cursor-pointer border-0 hover:text-[#1e1e1e]"
        data-theme-color-switch
      >
        {theme === 'dark' ?'🌙' :  '☀️'}
      </button>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes eyeMove {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-10px, -10px);
          }
          50% {
            transform: translate(10px, 10px);
          }
          75% {
            transform: translate(-10px, 10px);
          }
        }

        @keyframes eyeMoveReverse {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, 10px);
          }
          50% {
            transform: translate(-10px, -10px);
          }
          75% {
            transform: translate(10px, -10px);
          }
        }
      `}</style>
    </main>
  );
}
