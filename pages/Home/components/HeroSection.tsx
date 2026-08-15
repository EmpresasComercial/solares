import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CAROUSEL_IMAGES } from '../../../constants/images';

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = direita para esquerda

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#f4f4f4] aspect-[16/9] max-h-[240px]">
      {/* Slides Container */}
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'tween', ease: 'easeInOut', duration: 0.6 },
              opacity: { duration: 0.3 }
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={CAROUSEL_IMAGES[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Gradiente sutil para acabamento elegante */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

            {/* Logo / Tag AliExpress24 sobreposta no banner */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
              <img src="/update_logo_AliExpress24.png" alt="Logo" className="w-5 h-5 rounded object-cover" />
              <span className="text-white text-[11px] font-medium tracking-wide">AliExpress24</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores / Pontos de Navegação */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {CAROUSEL_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`transition-all rounded-full h-1.5 ${
              idx === currentIndex
                ? 'w-5 bg-[#C62828]'
                : 'w-1.5 bg-white/70 hover:bg-white'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};





