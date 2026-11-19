'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '@/lib/toast';

interface WhacAMoleGameProps {
  onContinue: () => void;
  onBack?: () => void;
}

type MoleType = 'royal-mole' | 'prince-frog' | 'teddy-love' | 'queen-crown';

interface MoleConfig {
  type: MoleType;
  emoji: string;
  name: string;
  points: number;
  bgGradient: string;
  borderColor: string;
  tag: string;
}

const MOLE_TYPES: Record<MoleType, MoleConfig> = {
  'royal-mole': {
    type: 'royal-mole',
    emoji: '👑🐹',
    name: 'Royal Mole',
    points: 1,
    bgGradient: 'from-amber-200 to-rose-200',
    borderColor: 'border-pink-300',
    tag: '+1 💕',
  },
  'prince-frog': {
    type: 'prince-frog',
    emoji: '🐸👑',
    name: 'Prince Frog',
    points: 1,
    bgGradient: 'from-emerald-200 to-teal-200',
    borderColor: 'border-emerald-300',
    tag: '+1 🐸',
  },
  'teddy-love': {
    type: 'teddy-love',
    emoji: '🧸💖',
    name: 'Love Teddy',
    points: 2,
    bgGradient: 'from-pink-200 to-purple-200',
    borderColor: 'border-purple-300',
    tag: '+2 💖',
  },
  'queen-crown': {
    type: 'queen-crown',
    emoji: '👑✨',
    name: 'Golden Tiara',
    points: 5,
    bgGradient: 'from-yellow-200 via-amber-200 to-yellow-400',
    borderColor: 'border-amber-400',
    tag: '+5 👑✨',
  },
};

const GRID_SIZE = 9;
const TARGET_SCORE = 10;
const GAME_DURATION = 30; // 30 seconds to reach 10 points

export default function WhacAMoleGame({
  onContinue,
  onBack,
}: WhacAMoleGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [currentMoleType, setCurrentMoleType] =
    useState<MoleType>('royal-mole');
  const [whackedHoles, setWhackedHoles] = useState<{
    [key: number]: { points: number; tag: string };
  }>({});
  const [showWinModal, setShowWinModal] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthesized retro/cute sounds with Web Audio API (no external file dependencies)
  const playCuteSound = useCallback(
    (kind: 'hit' | 'golden' | 'win' | 'start') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (kind === 'hit') {
          // High playful blip
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.13);
        } else if (kind === 'golden') {
          // Magical sparkling chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now);
          osc.frequency.setValueAtTime(830.61, now + 0.08);
          osc.frequency.setValueAtTime(1046.5, now + 0.16);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.36);
        } else if (kind === 'win') {
          // Joyful fanfare
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const noteOsc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            noteOsc.connect(noteGain);
            noteGain.connect(ctx.destination);
            noteOsc.type = 'triangle';
            noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
            noteGain.gain.setValueAtTime(0.2, now + idx * 0.1);
            noteGain.gain.exponentialRampToValueAtTime(
              0.01,
              now + idx * 0.1 + 0.3
            );
            noteOsc.start(now + idx * 0.1);
            noteOsc.stop(now + idx * 0.1 + 0.31);
          });
        } else if (kind === 'start') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.16);
        }
      } catch {
        // Audio autoplay or web audio not supported, silently ignore
      }
    },
    [soundEnabled]
  );

  // Check if player has reached win condition
  useEffect(() => {
    if (score >= TARGET_SCORE && !hasWon) {
      setHasWon(true);
      setIsPlaying(false);
      setActiveMole(null);
      playCuteSound('win');
      setTimeout(() => {
        setShowWinModal(true);
      }, 500);
    }
  }, [score, hasWon, playCuteSound]);

  // Main game loop (Timer + Mole jumping)
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let moleInterval: NodeJS.Timeout;

    if (isPlaying && timeLeft > 0 && !hasWon) {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setActiveMole(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Mole pop-up cycle
      moleInterval = setInterval(() => {
        const nextHole = Math.floor(Math.random() * GRID_SIZE);

        // Weighted randomness for mole types:
        // 15% Queen's Golden Tiara (+5)
        // 25% Teddy with Heart (+2)
        // 30% Prince Frog (+1)
        // 30% Royal Mole (+1)
        const rand = Math.random();
        let selectedType: MoleType = 'royal-mole';
        if (rand < 0.15) {
          selectedType = 'queen-crown';
        } else if (rand < 0.4) {
          selectedType = 'teddy-love';
        } else if (rand < 0.7) {
          selectedType = 'prince-frog';
        } else {
          selectedType = 'royal-mole';
        }

        setActiveMole(nextHole);
        setCurrentMoleType(selectedType);
      }, 850);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(moleInterval);
    };
  }, [isPlaying, timeLeft, hasWon]);

  const startGame = () => {
    playCuteSound('start');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setHasWon(false);
    setShowWinModal(false);
    setWhackedHoles({});
    setIsPlaying(true);
  };

  const handleWhac = (index: number) => {
    if (!isPlaying || activeMole !== index) return;

    const moleData = MOLE_TYPES[currentMoleType];
    const pts = moleData.points;

    // Trigger hit sound
    if (currentMoleType === 'queen-crown') {
      playCuteSound('golden');
    } else {
      playCuteSound('hit');
    }

    // Record float hit text
    setWhackedHoles((prev) => ({
      ...prev,
      [index]: { points: pts, tag: moleData.tag },
    }));

    setTimeout(() => {
      setWhackedHoles((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }, 700);

    setScore((prev) => prev + pts);
    setActiveMole(null);
  };

  const handleCopyRedeemMessage = async () => {
    const text =
      'Hey cutie hehehe! 💕 I just won the Princess Whac-A-Mole game 👑 and scored ' +
      score +
      ' points! Claiming my 1 Free Pappi right now 💋✨';
    try {
      await navigator.clipboard.writeText(text);
      showToast.success('Redemption message copied! DM him now cutie 😉💕');
    } catch {
      showToast.success('Claim your Free Pappi: DM me cutie hehehe 💋');
    }
  };

  return (
    <div className="page-container font-display relative min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-[#FFF5FA] via-[#FFF0F5] to-[#FCE7F3] text-gray-800 select-none overflow-hidden">
      {/* Decorative floating background elements */}
      <div className="absolute top-6 left-6 text-2xl animate-float-slow opacity-60">
        👑
      </div>
      <div className="absolute top-12 right-10 text-xl animate-float opacity-70">
        🌸
      </div>
      <div className="absolute bottom-12 left-10 text-2xl animate-float-slow opacity-60">
        ✨
      </div>
      <div className="absolute bottom-8 right-8 text-2xl animate-float opacity-70">
        💖
      </div>

      {/* Top Header & Navigation */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 px-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs sm:text-sm font-semibold text-[#9a4c73] shadow-sm border border-pink-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>💌</span>
            <span>Back to Letter</span>
          </button>
        )}

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-[#9a4c73] shadow-sm border border-pink-200 transition-all hover:scale-105 cursor-pointer ml-auto"
          title="Toggle Cute Sounds"
        >
          <span>{soundEnabled ? '🔊 Sound On' : '🔇 Muted'}</span>
        </button>
      </div>

      {/* Title Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 max-w-lg"
      >
        <span className="inline-block px-4 py-1 rounded-full bg-pink-100 text-[#f04299] text-xs font-bold uppercase tracking-wider mb-2 border border-pink-200 shadow-sm">
          Princess Day Mini-Game ✨
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#c0396f] flex items-center justify-center gap-2 drop-shadow-sm">
          <span>👑</span>
          <span>Whac-A-Princess-Mole!</span>
          <span>🐹</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9a4c73] mt-1.5 max-w-md mx-auto">
          Tap the cute royal critters & golden tiaras before they hide! Score{' '}
          <span className="font-bold text-[#f04299]">
            {TARGET_SCORE} points
          </span>{' '}
          to unlock your special prize! 💕
        </p>
      </motion.div>

      {/* Score & Timer Status Bar */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-5 py-2 rounded-full shadow-md border border-pink-200">
          <span className="text-lg">🏆</span>
          <div className="text-xs sm:text-sm font-bold text-[#9a4c73]">
            Score:{' '}
            <span className="text-lg sm:text-xl font-extrabold text-[#f04299]">
              {score}
            </span>
            <span className="text-xs text-gray-400 font-normal ml-1">
              /{TARGET_SCORE}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-5 py-2 rounded-full shadow-md border border-pink-200">
          <span className="text-lg">⏳</span>
          <div className="text-xs sm:text-sm font-bold text-[#9a4c73]">
            Time:{' '}
            <span
              className={`text-lg sm:text-xl font-extrabold ${
                timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#f04299]'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Whac-A-Mole 3x3 Playfield Grid */}
      <div className="relative bg-[#fce7f3]/70 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-xl border-4 border-pink-200/80 max-w-md w-full aspect-square">
        {/* Grassy Garden Burrow Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 h-full w-full">
          {Array.from({ length: GRID_SIZE }).map((_, index) => {
            const isActive = isPlaying && activeMole === index;
            const currentConfig = MOLE_TYPES[currentMoleType];
            const isHit = whackedHoles[index];

            return (
              <div
                key={index}
                onClick={() => handleWhac(index)}
                className="relative bg-gradient-to-b from-[#e2c1a8] to-[#9c7155] rounded-2xl overflow-hidden flex items-end justify-center cursor-pointer shadow-inner border-b-4 border-[#734e38] transition-transform active:scale-95 group"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Cute Burrow Rim & Grass Tuft */}
                <div className="absolute top-0 inset-x-0 h-3 bg-[#a7d489] rounded-t-xl opacity-90 border-b border-[#82b461]"></div>
                <div className="absolute bottom-1 w-4/5 h-4 bg-[#5c3e2b]/80 rounded-full blur-[2px] z-0"></div>

                {/* Little flowers on some holes */}
                {index % 2 === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] opacity-70">
                    🌸
                  </span>
                )}
                {index % 3 === 1 && (
                  <span className="absolute top-1 right-1 text-[10px] opacity-70">
                    🌼
                  </span>
                )}

                {/* Popping Mole / Character */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ y: 70, scale: 0.6 }}
                      animate={{ y: 6, scale: 1 }}
                      exit={{ y: 70, scale: 0.6 }}
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 22,
                      }}
                      className="absolute z-10 w-full flex flex-col items-center justify-center select-none"
                    >
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 ${currentConfig.borderColor} bg-gradient-to-tr ${currentConfig.bgGradient} transition-transform transform group-hover:scale-105`}
                      >
                        <span className="filter drop-shadow">
                          {currentConfig.emoji}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-full mt-0.5 shadow-sm">
                        {currentConfig.tag}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating "+Points" hit feedback */}
                <AnimatePresence>
                  {isHit && (
                    <motion.div
                      initial={{ y: 0, opacity: 1, scale: 0.8 }}
                      animate={{ y: -45, opacity: 0, scale: 1.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute z-30 pointer-events-none text-center font-extrabold text-sm sm:text-base text-pink-500 drop-shadow-md bg-white/95 px-2 py-0.5 rounded-full border border-pink-300"
                    >
                      {isHit.tag}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Start Game Prompt Overlay when not yet started */}
        {!isPlaying && timeLeft === GAME_DURATION && !hasWon && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-4 text-center z-20">
            <span className="text-4xl mb-2 animate-bounce">🐹👑</span>
            <h3 className="text-lg font-bold text-[#c0396f] mb-1">
              Ready, Princess?
            </h3>
            <p className="text-xs text-[#9a4c73] mb-4 max-w-xs">
              Catch the royal creatures to earn your prize!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-full bg-[#f04299] text-white font-bold shadow-lg hover:bg-[#e03388] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              Start Game 🚀
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {!isPlaying ? (
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f04299] text-white font-bold shadow-md hover:bg-[#e03388] transition-all transform hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base"
          >
            <span>✨</span>
            <span>{hasWon ? 'Play Again' : 'Start Whac-A-Mole'}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPlaying(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>⏸️</span>
            <span>Pause Game</span>
          </button>
        )}

        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#f04299] font-bold border-2 border-pink-300 shadow-md hover:bg-pink-50 transition-all transform hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base"
        >
          <span>🌻</span>
          <span>Go to Sunflower Garden</span>
        </button>
      </div>

      {/* Win Modal / Free Pappi Voucher Overlay */}
      <AnimatePresence>
        {showWinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#FFF9FC] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-pink-300 relative overflow-hidden"
            >
              {/* Confetti & Sparkles Top Badge */}
              <div className="text-5xl sm:text-6xl mb-2 animate-bounce">
                🎉👑💋
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#c0396f] mb-1">
                YOU WON, PRINCESS!
              </h2>
              <p className="text-xs sm:text-sm text-[#9a4c73] mb-4">
                Your royal reflexes are unmatched! Score:{' '}
                <span className="font-extrabold text-[#f04299]">{score}</span>{' '}
                points!
              </p>

              {/* The Official Free Pappi Voucher Box */}
              <div className="bg-gradient-to-tr from-pink-100 via-rose-50 to-amber-100 rounded-2xl p-4 sm:p-5 mb-5 border-2 border-dashed border-[#f04299]/60 shadow-inner relative">
                <span className="inline-block px-3 py-1 rounded-full bg-[#f04299] text-white text-[11px] font-bold uppercase tracking-widest shadow-sm mb-2">
                  🎁 Official Royal Voucher
                </span>

                <div className="text-xl sm:text-2xl font-black text-[#c0396f] tracking-wide my-1 flex items-center justify-center gap-2">
                  <span>💋</span>
                  <span>1 FREE PAPPI!</span>
                  <span>💋</span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-[#831843] mt-2">
                  To redeem that: <br />
                  <span className="text-[#be185d] font-bold underline decoration-pink-400">
                    &quot;DM me cutie hehehe&quot;
                  </span>{' '}
                  😉💕
                </p>
              </div>

              {/* Action Buttons inside Voucher */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCopyRedeemMessage}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#f04299] to-[#be185d] hover:from-[#e03388] hover:to-[#9d174d] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>DM Me Cutie (Copy Claim)</span>
                </button>

                <button
                  onClick={onContinue}
                  className="w-full py-3 px-4 rounded-xl bg-[#FFF0F5] hover:bg-pink-100 text-[#c0396f] font-bold text-sm sm:text-base border border-pink-300 shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🌻</span>
                  <span>Continue to Sunset Sunflower Garden ✨</span>
                </button>

                <button
                  onClick={startGame}
                  className="text-xs text-[#9a4c73] hover:text-[#f04299] py-1 transition-colors cursor-pointer"
                >
                  Play Whac-A-Mole Again 🔄
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time's up modal if didn't win */}
      <AnimatePresence>
        {!isPlaying && timeLeft === 0 && !hasWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border-4 border-pink-200"
            >
              <div className="text-5xl mb-2">🥺👑</div>
              <h3 className="text-xl font-bold text-[#c0396f] mb-1">
                So Close, Princess!
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                You scored{' '}
                <span className="font-bold text-[#f04299]">{score}</span>{' '}
                points! You need {TARGET_SCORE} to win the Free Pappi!
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={startGame}
                  className="py-2.5 px-6 rounded-full bg-[#f04299] text-white font-bold text-sm shadow hover:bg-[#e03388] transition cursor-pointer"
                >
                  Try Again for the Free Pappi 💋
                </button>
                <button
                  onClick={onContinue}
                  className="py-2.5 px-6 rounded-full bg-pink-50 text-[#c0396f] font-semibold text-xs border border-pink-200 transition cursor-pointer"
                >
                  Skip to Sunflower Garden 🌻
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
