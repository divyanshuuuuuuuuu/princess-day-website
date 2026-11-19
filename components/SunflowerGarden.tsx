'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { asset } from '@/lib/assets';

interface SunflowerGardenProps {
  onContinue: () => void;
  onBack?: () => void;
  onRestart?: () => void;
}

// Detailed realistic Sunflower SVG
interface SunflowerProps {
  scale?: number;
  swayDuration?: number;
  swayDelay?: number;
  rotation?: number;
  stemHeight?: number;
  className?: string;
  onClick?: () => void;
}

function Sunflower({
  scale = 1,
  swayDuration = 4,
  swayDelay = 0,
  rotation = 0,
  stemHeight = 120,
  className = '',
  onClick,
}: SunflowerProps) {
  // Generate 16 outer petals and 12 inner petals for realistic fullness
  const outerPetals = useMemo(() => Array.from({ length: 16 }), []);
  const innerPetals = useMemo(() => Array.from({ length: 12 }), []);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer origin-bottom transition-transform hover:brightness-110 ${className}`}
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      <div
        className="sunflower-wind-sway"
        style={{
          animationDuration: `${swayDuration}s`,
          animationDelay: `${swayDelay}s`,
        }}
      >
        <svg
          width="110"
          height={stemHeight + 60}
          viewBox={`0 0 110 ${stemHeight + 60}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible filter drop-shadow-sm"
        >
          {/* Curved natural stem */}
          <path
            d={`M 55,${55} Q 50,${55 + stemHeight * 0.5} 55,${55 + stemHeight}`}
            stroke="url(#stemGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Left leaf */}
          <path
            d={`M 53,${55 + stemHeight * 0.4} C 25,${55 + stemHeight * 0.35} 20,${55 + stemHeight * 0.5} 53,${55 + stemHeight * 0.52}`}
            fill="url(#leafGrad)"
            stroke="#15803d"
            strokeWidth="1"
          />

          {/* Right leaf */}
          <path
            d={`M 54,${55 + stemHeight * 0.65} C 85,${55 + stemHeight * 0.6} 90,${55 + stemHeight * 0.75} 55,${55 + stemHeight * 0.78}`}
            fill="url(#leafGrad)"
            stroke="#15803d"
            strokeWidth="1"
          />

          {/* Calyx (green sepals behind flower head) */}
          <g transform="translate(55, 55)">
            {Array.from({ length: 8 }).map((_, i) => (
              <polygon
                key={`sepal-${i}`}
                points="0,0 -7,-24 0,-30 7,-24"
                fill="#166534"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>

          {/* Outer Layer of Golden Radiant Petals */}
          <g transform="translate(55, 55)">
            {outerPetals.map((_, i) => (
              <path
                key={`outer-${i}`}
                d="M 0,-15 C -7,-26 -8,-36 0,-44 C 8,-36 7,-26 0,-15 Z"
                fill="url(#outerPetalGrad)"
                stroke="#d97706"
                strokeWidth="0.5"
                transform={`rotate(${i * 22.5})`}
              />
            ))}
          </g>

          {/* Inner Layer of Rich Golden-Amber Petals (offset for fullness) */}
          <g transform="translate(55, 55)">
            {innerPetals.map((_, i) => (
              <path
                key={`inner-${i}`}
                d="M 0,-12 C -6,-20 -6,-30 0,-38 C 6,-30 6,-20 0,-12 Z"
                fill="url(#innerPetalGrad)"
                stroke="#b45309"
                strokeWidth="0.5"
                transform={`rotate(${i * 30 + 15})`}
              />
            ))}
          </g>

          {/* Realistic Center Seed Disk with Concentric Rings */}
          <g transform="translate(55, 55)">
            {/* Outer dark disk */}
            <circle cx="0" cy="0" r="16" fill="url(#centerGrad)" />
            {/* Golden seed ring */}
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="none"
              stroke="#b45309"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            {/* Inner seed ring */}
            <circle
              cx="0"
              cy="0"
              r="10"
              fill="none"
              stroke="#92400e"
              strokeWidth="1.5"
              strokeDasharray="1.5 1.5"
            />
            {/* Dark deep core */}
            <circle cx="0" cy="0" r="6" fill="#261005" />
            <circle
              cx="0"
              cy="0"
              r="3"
              fill="#fbbf24"
              opacity="0.4"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function SunflowerGarden({
  onContinue,
  onBack,
  onRestart,
}: SunflowerGardenProps) {
  const [breezeSound, setBreezeSound] = useState(false);
  const [sparkleCount, setSparkleCount] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialSeekDoneRef = useRef(false);

  // Auto-play Khaab song starting at 2:00 (120s) on initial load, and loop from 00:00 when finished
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.8;

    const setInitialTime = () => {
      if (!initialSeekDoneRef.current) {
        try {
          audio.currentTime = 120; // Start from 2:00
          initialSeekDoneRef.current = true;
        } catch {
          // seek deferred
        }
      }
    };

    const handleEnded = () => {
      // When song finishes, start again from the beginning (00:00)
      try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    };

    audio.addEventListener('loadedmetadata', setInitialTime);
    audio.addEventListener('canplay', setInitialTime);
    audio.addEventListener('ended', handleEnded);

    // If metadata is already loaded
    if (audio.readyState >= 1 && !initialSeekDoneRef.current) {
      setInitialTime();
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingSong(true);
          if (!initialSeekDoneRef.current && audio.currentTime < 120) {
            setInitialTime();
          }
        })
        .catch((err) => {
          console.log('Autoplay deferred until user interaction:', err);
          setIsPlayingSong(false);
        });
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setInitialTime);
      audio.removeEventListener('canplay', setInitialTime);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const toggleSong = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingSong) {
      audio.pause();
      setIsPlayingSong(false);
    } else {
      audio
        .play()
        .then(() => setIsPlayingSong(true))
        .catch(() => { });
    }
  };

  const handleContinue = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onContinue();
  };

  const handleBack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (onBack) {
      onBack();
    }
  };

  // Soft ambient evening chime / gentle breeze sound (Web Audio API)
  const toggleBreezeSound = () => {
    const nextState = !breezeSound;
    setBreezeSound(nextState);

    if (nextState && typeof window !== 'undefined') {
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

        // Play gentle, serene sunset bell chords
        const freqs = [392.0, 587.33, 659.25, 880.0]; // G4, D5, E5, A5 peaceful pentatonic
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.4);
          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.4);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.4 + 0.1);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + idx * 0.4 + 2.5
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.4);
          osc.stop(ctx.currentTime + idx * 0.4 + 2.6);
        });
      } catch {
        // audio unavailable, ignore
      }
    }
  };

  const handleFlowerClick = () => {
    setSparkleCount((c) => c + 1);
  };

  return (
    <div className="font-display relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none">
      {/* Custom CSS for continuous wind sway and drifting petals */}
      <style jsx global>{`
        @keyframes windSway {
          0%,
          100% {
            transform: rotate(-3deg) skewX(-1deg);
          }
          50% {
            transform: rotate(4.5deg) skewX(2deg);
          }
        }
        @keyframes windSwayAlt {
          0%,
          100% {
            transform: rotate(-1.5deg) skewX(-0.5deg);
          }
          50% {
            transform: rotate(6deg) skewX(2.5deg);
          }
        }
        .sunflower-wind-sway {
          transform-origin: bottom center;
          animation: windSway ease-in-out infinite alternate;
        }
        @keyframes windDrift {
          0% {
            transform: translate(-10vw, -10vh) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            transform: translate(110vw, 40vh) rotate(720deg);
            opacity: 0;
          }
        }
        .wind-petal {
          position: absolute;
          pointer-events: none;
          animation: windDrift linear infinite;
        }
        @keyframes sunGlowPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }
        .sun-glow {
          animation: sunGlowPulse 6s ease-in-out infinite;
        }
        @keyframes heartRise {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          30% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-80px) scale(1.2);
            opacity: 0;
          }
        }
        .rising-heart {
          animation: heartRise 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* SVG Gradient Definitions (used across all realistic flowers and sky) */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <linearGradient id="outerPetalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="innerPetalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d1d0c" />
            <stop offset="65%" stopColor="#2b1407" />
            <stop offset="90%" stopColor="#69300c" />
            <stop offset="100%" stopColor="#9a3412" />
          </radialGradient>

          <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Sunset Sky Radial Glow */}
          <radialGradient id="sunAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="35%" stopColor="#fb923c" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#881337" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Layer 1: Cinematic Sunset Sky Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(to bottom, #1e1b4b 0%, #31104b 15%, #4c1d95 28%, #701a75 42%, #9d174d 56%, #c2410c 70%, #ea580c 82%, #fbbf24 94%, #fef08a 100%)',
        }}
      >
        {/* Twinkling evening stars in the upper twilight sky */}
        <div className="absolute inset-x-0 top-0 h-48 pointer-events-none">
          <div className="absolute top-6 left-12 w-1.5 h-1.5 bg-white rounded-full opacity-80 animate-pulse"></div>
          <div
            className="absolute top-10 right-24 w-2 h-2 bg-yellow-200 rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-20 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute top-14 right-1/3 w-1.5 h-1.5 bg-pink-200 rounded-full opacity-75 animate-pulse"
            style={{ animationDelay: '1.5s' }}
          ></div>
          <div
            className="absolute top-4 left-2/3 w-2 h-2 bg-yellow-100 rounded-full opacity-80 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          ></div>
        </div>

        {/* The Golden Sunset Sun sinking into the horizon */}
        <div className="absolute bottom-[28%] sm:bottom-[32%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          {/* Outer Sun Glow Aura */}
          <div className="sun-glow absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-yellow-300/40 via-orange-400/30 to-pink-500/20 blur-2xl"></div>

          {/* Core Golden Sun Disc */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-t from-[#f59e0b] via-[#fbbf24] to-[#fef08a] shadow-[0_0_80px_rgba(251,191,36,0.9)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-yellow-100/30 filter blur-[1px]"></div>
          </div>

          {/* Soft horizontal cloud bands in front of the sun */}
          <div className="absolute w-80 h-3 bg-gradient-to-r from-transparent via-[#f43f5e]/50 to-transparent rounded-full blur-[2px] top-[40%]"></div>
          <div className="absolute w-96 h-2 bg-gradient-to-r from-transparent via-[#ea580c]/60 to-transparent rounded-full blur-[1px] top-[60%]"></div>
        </div>
      </div>

      {/* Layer 2: Drifting Wind Particles (Sunflower petals & dandelion wisps) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={`petal-${i}`}
            className="wind-petal flex items-center justify-center"
            style={{
              top: `${15 + (i * 5.5) % 65}%`,
              left: `${-5 - (i * 8) % 25}%`,
              animationDuration: `${7 + (i % 5) * 2}s`,
              animationDelay: `${i * 1.1}s`,
            }}
          >
            {i % 2 === 0 ? (
              // Golden sunflower petal
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path
                  d="M0,5 C5,0 15,0 20,5 C15,10 5,10 0,5 Z"
                  fill="#fbbf24"
                  opacity="0.85"
                />
              </svg>
            ) : (
              // Drifting glowing spore / spark
              <div className="w-2 h-2 rounded-full bg-yellow-200/90 shadow-[0_0_8px_rgba(254,240,138,0.9)]"></div>
            )}
          </div>
        ))}
      </div>

      {/* Layer 3: Distant Twilight Mountain Silhouette */}
      <div className="absolute inset-x-0 bottom-[24%] sm:bottom-[28%] z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto preserve-3d"
        >
          <path
            d="M0,180 Q220,100 480,140 T960,110 T1440,160 L1440,240 L0,240 Z"
            fill="#3b0764"
            opacity="0.5"
          />
          <path
            d="M0,150 Q320,60 720,110 T1440,130 L1440,240 L0,240 Z"
            fill="#581c87"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Layer 4: Midground Rolling Hill with dense field of sunflowers */}
      <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          {/* Back grassy hill illuminated by golden sunset */}
          <path
            d="M0,220 Q360,110 720,170 T1440,130 L1440,420 L0,420 Z"
            fill="url(#midHillGrad)"
          />
          {/* Front lush hill where the two people are sitting */}
          <path
            d="M0,260 Q420,160 880,210 T1440,230 L1440,420 L0,420 Z"
            fill="url(#frontHillGrad)"
          />
          <defs>
            <linearGradient id="midHillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#713f12" />
              <stop offset="30%" stopColor="#3f6212" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
            <linearGradient id="frontHillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4d7c0f" />
              <stop offset="40%" stopColor="#166534" />
              <stop offset="100%" stopColor="#052e16" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Layer 5: Field of Sunflowers Across the Hills (Moving with the wind) */}
      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto overflow-hidden h-72 sm:h-96">
        {/* Background small sunflowers waving in wind */}
        <div className="absolute inset-x-0 bottom-16 sm:bottom-28 flex justify-between px-2 sm:px-10 opacity-80 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <Sunflower
              key={`bg-sunflower-${i}`}
              scale={0.42 + (i % 3) * 0.08}
              stemHeight={60 + (i % 4) * 15}
              swayDuration={3.5 + (i % 4) * 0.6}
              swayDelay={i * 0.35}
              rotation={((i % 5) - 2) * 3}
            />
          ))}
        </div>

        {/* Midground medium sunflowers waving with wind */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-12 flex justify-between px-4 sm:px-14 z-20">
          {Array.from({ length: 9 }).map((_, i) => (
            <Sunflower
              key={`mid-sunflower-${i}`}
              scale={0.65 + (i % 3) * 0.12}
              stemHeight={80 + (i % 3) * 20}
              swayDuration={4.2 + (i % 3) * 0.7}
              swayDelay={i * 0.45}
              rotation={((i % 3) - 1) * 4}
              onClick={handleFlowerClick}
            />
          ))}
        </div>

        {/* Foreground Large realistic sunflowers framing the view and swaying gently */}
        <div className="absolute -bottom-4 left-2 sm:left-8 z-30">
          <Sunflower
            scale={1.05}
            stemHeight={130}
            swayDuration={4.8}
            swayDelay={0.2}
            rotation={-4}
            onClick={handleFlowerClick}
          />
        </div>
        <div className="absolute -bottom-2 left-20 sm:left-36 z-30 hidden xs:block">
          <Sunflower
            scale={0.88}
            stemHeight={110}
            swayDuration={4.4}
            swayDelay={0.8}
            rotation={2}
            onClick={handleFlowerClick}
          />
        </div>
        <div className="absolute -bottom-4 right-2 sm:right-8 z-30">
          <Sunflower
            scale={1.1}
            stemHeight={140}
            swayDuration={5.2}
            swayDelay={0.5}
            rotation={4}
            onClick={handleFlowerClick}
          />
        </div>
        <div className="absolute -bottom-2 right-24 sm:right-40 z-30 hidden xs:block">
          <Sunflower
            scale={0.85}
            stemHeight={115}
            swayDuration={4.0}
            swayDelay={1.1}
            rotation={-3}
            onClick={handleFlowerClick}
          />
        </div>
      </div>

      {/* Layer 6: THE TWO PEOPLE SITTING TOGETHER AND LOOKING AT THE SUNSET */}
      {/* MANDATORY: One person is BLUE, one person is PINK, made using objects like CIRCLES and other geometric shapes! */}
      <div className="absolute bottom-[24%] sm:bottom-[29%] left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative flex flex-col items-center"
        >
          {/* Animated Rising Heart from between them into the sunset */}
          <div className="rising-heart absolute -top-8 text-xl sm:text-2xl filter drop-shadow">
            💖
          </div>

          {/* SVG Illustration of the 2 People Made of Geometric Objects (Circles, Ellipses, Rectangles) */}
          <svg
            width="170"
            height="140"
            viewBox="0 0 170 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-lg"
          >
            {/* Soft Shadow on Grassy Hill */}
            <ellipse
              cx="85"
              cy="126"
              rx="48"
              ry="10"
              fill="#064e3b"
              opacity="0.6"
            />

            {/* Cozy sitting blanket / mound */}
            <ellipse
              cx="85"
              cy="122"
              rx="44"
              ry="8"
              fill="#fef08a"
              opacity="0.8"
            />

            {/* ======================================================== */}
            {/* PERSON 1: BLUE PERSON (Divyanshu) - Made of CIRCLES & Shapes */}
            {/* ======================================================== */}
            <g id="blue-person" transform="translate(18, 12)">
              {/* Sitting legs folded on the grass (rounded rectangle & circle feet) */}
              <rect
                x="28"
                y="85"
                width="28"
                height="14"
                rx="7"
                fill="#1e3a8a"
              />
              <circle cx="28" cy="92" r="7" fill="#1d4ed8" />
              <circle cx="56" cy="92" r="6" fill="#1d4ed8" />

              {/* Blue Body / Torso (Ellipse) */}
              <ellipse
                cx="42"
                cy="68"
                rx="16"
                ry="22"
                fill="#2563eb"
                stroke="#1d4ed8"
                strokeWidth="1.5"
              />

              {/* Sweater collar (Circle) */}
              <circle cx="42" cy="48" r="6" fill="#60a5fa" />

              {/* Blue Arm reaching over to hold hands (Rounded Rect & Circle hand) */}
              <rect
                x="44"
                y="62"
                width="24"
                height="8"
                rx="4"
                transform="rotate(22 44 62)"
                fill="#3b82f6"
              />
              {/* Hand (Circle) meeting pink person's hand */}
              <circle
                cx="68"
                cy="73"
                r="5"
                fill="#93c5fd"
                stroke="#2563eb"
                strokeWidth="1"
              />

              {/* Blue Head (COMPULSORY CIRCLE) */}
              <circle
                cx="42"
                cy="34"
                r="16"
                fill="#60a5fa"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Blue Hair / details (Circles) */}
              <circle cx="34" cy="22" r="7" fill="#1d4ed8" />
              <circle cx="42" cy="20" r="8" fill="#1e40af" />
              <circle cx="50" cy="23" r="6.5" fill="#1d4ed8" />
              <circle cx="30" cy="30" r="5" fill="#1d4ed8" />

              {/* Blue Ear (Circle) */}
              <circle cx="27" cy="35" r="4" fill="#93c5fd" />

              {/* Cute Blush (Circle) */}
              <circle
                cx="34"
                cy="38"
                r="3"
                fill="#93c5fd"
                opacity="0.8"
              />
            </g>

            {/* ======================================================== */}
            {/* PERSON 2: PINK PERSON (Princess Sneha) - Made of CIRCLES */}
            {/* ======================================================== */}
            <g id="pink-person" transform="translate(18, 12)">
              {/* Sitting legs folded on the grass (rounded rectangle & circle feet) */}
              <rect
                x="64"
                y="86"
                width="26"
                height="13"
                rx="6.5"
                fill="#9d174d"
              />
              <circle cx="64" cy="92" r="6" fill="#be185d" />
              <circle cx="90" cy="92" r="6" fill="#be185d" />

              {/* Pink Body / Torso (Ellipse) */}
              <ellipse
                cx="74"
                cy="70"
                rx="15"
                ry="21"
                fill="#db2777"
                stroke="#be185d"
                strokeWidth="1.5"
              />

              {/* Dress neckline / accessory (Circle) */}
              <circle cx="72" cy="51" r="5" fill="#f472b6" />

              {/* Pink Arm holding blue person's hand (Rounded Rect & Circle hand) */}
              <rect
                x="60"
                y="65"
                width="20"
                height="7.5"
                rx="3.75"
                transform="rotate(-15 60 65)"
                fill="#ec4899"
              />
              {/* Hand (Circle) resting on blue person's hand */}
              <circle
                cx="67"
                cy="73"
                r="4.5"
                fill="#fbcfe8"
                stroke="#db2777"
                strokeWidth="1"
              />

              {/* Pink Head (COMPULSORY CIRCLE - leaning affectionately on Blue's shoulder) */}
              <circle
                cx="68"
                cy="37"
                r="15"
                fill="#f472b6"
                stroke="#ec4899"
                strokeWidth="2"
              />

              {/* Cute Hair Buns & Details (Circles) */}
              <circle cx="81" cy="30" r="8" fill="#be185d" />
              <circle cx="74" cy="24" r="7.5" fill="#9d174d" />
              <circle cx="66" cy="24" r="6.5" fill="#be185d" />
              {/* Hair Blossom Pin (Yellow center circle with white circle petals) */}
              <circle cx="77" cy="27" r="3.5" fill="#fef08a" />
              <circle cx="77" cy="27" r="1.5" fill="#ca8a04" />

              {/* Pink Ear (Circle) */}
              <circle cx="83" cy="38" r="3.5" fill="#fbcfe8" />

              {/* Cute Cheek Blush (Circle) */}
              <circle
                cx="74"
                cy="41"
                r="3"
                fill="#fda4af"
                opacity="0.9"
              />
            </g>

            {/* Shared golden glow over their linked hands */}
            <circle
              cx="86"
              cy="85"
              r="7"
              fill="#fde047"
              opacity="0.5"
              filter="blur(2px)"
            />
          </svg>

          {/* Romantic Caption Tag */}
          <div className="mt-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold shadow-md flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>
            <span>You &amp; Me</span>
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block"></span>
            <span>• Watching Sunset Forever 🌅</span>
            <span className="text-amber-300 font-medium hidden xs:inline">• (Still on wishlist ✨)</span>
          </div>
        </motion.div>
      </div>

      {/* Hidden audio element for Khaab - Akhil */}
      <audio
        ref={audioRef}
        src={asset('/assets/khaab.mp3')}
        preload="auto"
      />

      {/* Top Header & Floating Navigation Controls */}
      <div className="relative z-50 w-full px-4 sm:px-8 pt-4 sm:pt-6 flex flex-col items-center gap-3">
        {/* Navigation Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          {onBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/20 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>←</span>
              <span>Back to Mini-Game</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {/* Song Player Toggle (Khaab - Akhil) */}
            <button
              onClick={toggleSong}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-pink-300/40 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlayingSong ? 'Pause Song' : 'Play Song'}
            >
              <span className="text-sm">{isPlayingSong ? '🎶' : '🔇'}</span>
              <span className="text-amber-200">Khaab</span>
              {isPlayingSong ? (
                <span className="flex items-center gap-0.5 ml-0.5">
                  <span className="w-1 h-3 bg-pink-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-4 bg-yellow-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              ) : (
                <span className="text-[10px] text-pink-200 ml-0.5">▶ Play</span>
              )}
            </button>

            <button
              onClick={toggleBreezeSound}
              className="hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg transition-all hover:scale-105 cursor-pointer"
              title="Toggle Evening Chime"
            >
              <span>{breezeSound ? '🎐 Chime On' : '🍃 Chime Off'}</span>
            </button>

            {onRestart && (
              <button
                onClick={onRestart}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                <span>Restart 🔄</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Elegant Romantic Banner (Moved to top so sunset and lovers are crystal clear!) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/35 backdrop-blur-md px-5 py-2.5 sm:px-7 sm:py-3 rounded-2xl sm:rounded-3xl border border-white/20 shadow-xl text-center max-w-xl mx-auto pointer-events-none"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-base sm:text-lg">🌻</span>
            <h2 className="text-sm sm:text-lg font-extrabold text-amber-200 drop-shadow-sm tracking-wide">
              Our Sunflower Sunset Meadow
            </h2>
            <span className="text-base sm:text-lg">🌅</span>
          </div>
          <p className="text-[11px] sm:text-xs text-pink-100/90 mt-1 font-medium leading-relaxed max-w-md mx-auto">
            &ldquo;In a garden full of blooming sunflowers swaying with the wind, two hearts sit quietly together, watching the golden sun dip beneath the horizon, <span className="text-amber-300 font-semibold italic">still on our wishlist 🌻🌅✨</span>&rdquo;
          </p>
          <div className="text-[10px] sm:text-[11px] text-amber-300 font-semibold mt-1">
            Tap any sunflower to watch it bloom with love 💛
          </div>
        </motion.div>
      </div>

      {/* Spacious Open Sunset Sky View */}
      <div className="flex-1 min-h-[80px] pointer-events-none"></div>

      {/* Bottom Floating Journey Control / Continue Button */}
      <div className="relative z-50 w-full px-4 pb-8 sm:pb-10 flex flex-col items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#f04299] text-white font-bold text-sm sm:text-base shadow-[0_4px_25px_rgba(245,158,11,0.5)] border border-yellow-200/40 hover:shadow-[0_6px_30px_rgba(240,66,153,0.6)] transition-all cursor-pointer"
        >
          <span>🎵</span>
          <span>Continue to Our Songs Playlist</span>
          <span>✨</span>
        </motion.button>

        <p className="text-[11px] text-white/70 backdrop-blur-sm px-3 py-1 rounded-full bg-black/20">
          The romantic journey continues with our special playlist 🎶
        </p>
      </div>
    </div>
  );
}
