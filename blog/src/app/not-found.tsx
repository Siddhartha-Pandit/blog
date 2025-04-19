'use client';

import { useEffect, useState, useCallback } from 'react';

export default function NotFoundPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [fallingStars, setFallingStars] = useState<any[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameActive, setGameActive] = useState(false);

  // Theme management
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // High score tracking
  useEffect(() => {
    const savedHighScore = localStorage.getItem('starCatcherHighScore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, []);

  // Star spawning logic
  const spawnStar = useCallback(() => {
    const newStar = {
      id: Math.random().toString(36).substr(2, 9),
      position: Math.random() * 90,
      speed: Math.random() * 3 + 2
    };
    setFallingStars(prev => [...prev, newStar]);
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameActive) return;
    
    const starInterval = setInterval(spawnStar, 1500);
    return () => clearInterval(starInterval);
  }, [gameActive, spawnStar]);

  // Star catching logic
  const catchStar = (id: string) => {
    setScore(prev => {
      const newScore = prev + 1;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('starCatcherHighScore', newScore.toString());
      }
      return newScore;
    });
    setFallingStars(prev => prev.filter(star => star.id !== id));
  };

  // Start game handler
  const startGame = () => {
    setShowInstructions(false);
    setGameActive(true);
    setScore(0);
    setFallingStars([]);
  };

  // Responsive touch/click handler
  const handleStarClick = (e: React.TouchEvent | React.MouseEvent, id: string) => {
    e.preventDefault();
    catchStar(id);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] dark:bg-[#1e1e1e] relative overflow-hidden">
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl max-w-md text-center space-y-6 animate-popIn">
            <h2 className="text-3xl font-bold text-yellow-400">How to Play</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>✨ Tap/click falling stars to catch them!</p>
              <p>🏆 Beat your high score!</p>
              <p>🌙 Toggle dark mode anytime</p>
              <p>🚫 Don't let stars hit the ground!</p>
            </div>
            <button
              onClick={startGame}
              className="bg-yellow-400 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-yellow-500 transition-all"
            >
              Start Game!
            </button>
          </div>
        </div>
      )}

      {/* Game Interface */}
      <div className="flex flex-col items-center gap-8 text-center px-4 w-full max-w-4xl">
        {/* Score Header */}
        <div className="w-full flex justify-between items-center px-4">
          <div className="text-2xl sm:text-3xl text-yellow-400 font-bold">
            Score: {score}
          </div>
          <div className="text-xl sm:text-2xl text-yellow-400">
            High Score: {highScore}
          </div>
        </div>

        {/* Play Area */}
        <div className="relative w-full h-96 sm:h-[500px] bg-gradient-to-b from-blue-400/20 to-purple-500/20 rounded-3xl overflow-hidden border-4 border-yellow-400/30">
          {fallingStars.map(star => (
            <div
              key={star.id}
              className="absolute touch-none cursor-pointer"
              style={{
                left: `${star.position}%`,
                top: '-50px',
                animation: `fall ${star.speed}s linear`
              }}
              onTouchStart={(e) => handleStarClick(e, star.id)}
              onClick={(e) => handleStarClick(e, star.id)}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-300 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white/40 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <a
            href="/"
            className="bg-yellow-400 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-yellow-500 transition-all shadow-lg"
          >
            🏡 Return Home
          </a>
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="text-4xl hover:scale-110 transition-transform"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="text-4xl hover:scale-110 transition-transform"
          >
            ❓
          </button>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 animate-float">
            Lost in Space? 🌌
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            404 Error - Let's catch some stars instead!
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fall {
          to { transform: translateY(110vh); }
        }
        
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-popIn {
          animation: popIn 0.3s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}