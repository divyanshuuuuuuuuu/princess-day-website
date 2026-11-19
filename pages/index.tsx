'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Hero from '@/components/Hero';
import MessageCard from '@/components/MessageCard';
import Confetti from '@/components/Confetti';
import { Toaster } from '@/lib/toast';
import { asset } from '@/lib/assets';

const PRELOAD_IMAGES = [
  '/assets/intro-DzUiguR4.webp',
  '/assets/intro-BrJOTFFc.webp',
  '/assets/letter-C680mUtz.webp',
  '/assets/pic1.png',
  '/assets/pic2.png',
  '/assets/pic3.png',
  '/assets/music1.png',
  '/assets/music2.png',
  '/assets/music3.png',
];

export default function Home() {
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Eagerly preload all critical illustrations, cards & music assets as soon as site opens
  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.src = asset(src);
    });
  }, []);

  const handleOpenGift = () => {
    setIsGiftOpened(true);
    setShowConfetti(true);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  const handleRestart = () => {
    setIsGiftOpened(false);
    setShowConfetti(false);
  };

  const toastOptions = {
    duration: 3000,
    style: {
      background: 'var(--primary)',
      color: 'var(--text)',
      borderRadius: '12px',
      padding: '12px 20px',
      fontSize: '14px',
    },
  };

  return (
    <>
      <Head>
        <title>Princess Day Website 👑 Romantic Surprise for Your Princess</title>
        <meta
          name="description"
          content="Princess Day Website: A magical, interactive romantic surprise website for your girlfriend with love letters, sunflower sunset meadow, Whac-A-Mole mini-game, and love playlist."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="princess day website, princess-day-website, national princess day website, website for girlfriend, romantic website, love letter surprise, custom website for girlfriend"
        />
        <meta name="author" content="Divyanshu" />

        {/* Preload all critical illustrations & photos so they appear instantly */}
        {PRELOAD_IMAGES.map((src) => (
          <link
            key={src}
            rel="preload"
            as="image"
            href={asset(src)}
          />
        ))}

        {/* Favicon - Multiple formats for better browser support */}
        <link rel="icon" type="image/svg+xml" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.svg`} />
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.ico`} sizes="any" />
        <link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.svg`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Princess Day Website 👑 Romantic Surprise for Your Princess" />
        <meta
          property="og:description"
          content="Princess Day Website: A magical interactive romantic surprise website for your girlfriend with love letters, sunflower sunset meadow, and mini-game."
        />
        <meta property="og:image" content="/og-image.jpg" />
        <meta
          property="og:url"
          content="https://github.com/divyanshuuuuuuuuu/princess-day-website"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Princess Day Website 👑 Romantic Surprise for Your Princess" />
        <meta
          name="twitter:description"
          content="Princess Day Website: A magical romantic surprise website for your girlfriend with love letters, sunflower meadow, and playlist."
        />
        <meta name="twitter:image" content="/og-image.jpg" />

        {/* Additional SEO */}
        <meta name="theme-color" content="#fff8e7" />
        <link rel="canonical" href="https://github.com/divyanshuuuuuuuuu/princess-day-website" />

        {/* Structured Data (JSON-LD) for Google Search Engine Optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Princess Day Website',
              url: 'https://github.com/divyanshuuuuuuuuu/princess-day-website',
              description:
                'A magical interactive romantic surprise website for National Princess Day featuring a love letter, Whac-A-Mole mini-game, sunflower sunset serenade, and love song playlist.',
              applicationCategory: 'EntertainmentApplication',
              operatingSystem: 'All',
              author: {
                '@type': 'Person',
                name: 'Divyanshu',
                telephone: '+919303044289',
              },
            }),
          }}
        />
      </Head>

      <main className="min-h-screen">
        {!isGiftOpened && (
          <Hero onOpenGift={handleOpenGift} isGiftOpened={isGiftOpened} />
        )}
        {isGiftOpened && (
          <MessageCard isRevealed={isGiftOpened} onRestart={handleRestart} />
        )}
        <Confetti trigger={showConfetti} onComplete={handleConfettiComplete} />
      </main>

      <Toaster position="bottom-center" toastOptions={toastOptions} />
    </>
  );
}
