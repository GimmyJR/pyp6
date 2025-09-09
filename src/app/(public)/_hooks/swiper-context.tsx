"use client";
import React, { createContext, useContext, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { SwiperRef } from 'swiper/react';

interface SwiperContextType {
  swiperRef: React.RefObject<SwiperRef>;
  handleSwiper: (swiper: SwiperType) => void;
}

const SwiperContext = createContext<SwiperContextType | null>(null);

export const SwiperProvider = ({ children }: { children: React.ReactNode }) => {
  const swiperRef = useRef<SwiperRef>(null);

  const handleSwiper = (swiper: SwiperType) => {
    if (swiperRef.current) {
      swiperRef.current.swiper = swiper;
    }
  };

  return (
    <SwiperContext.Provider value={{ swiperRef, handleSwiper }}>
      {children}
    </SwiperContext.Provider>
  );
};

export const useSwiper = () => {
  const context = useContext(SwiperContext);
  if (!context) {
    throw new Error('useSwiper must be used within a SwiperProvider');
  }
  return context;
};
