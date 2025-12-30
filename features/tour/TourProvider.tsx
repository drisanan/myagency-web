'use client';

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { driver, Driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

type TourContextType = {
  startTour: (tourKey: string, steps: DriveStep[]) => void;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within a TourProvider');
  return ctx;
}

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const driverRef = useRef<Driver | null>(null);
  const tourKeyRef = useRef<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  const startTour = useCallback((key: string, steps: DriveStep[]) => {
    const done = typeof window !== 'undefined' ? localStorage.getItem(`tour_completed_${key}`) : null;
    if (done) return;

    // Destroy any existing driver instance
    driverRef.current?.destroy();
    tourKeyRef.current = key;

    driverRef.current = driver({
      showProgress: true,
      steps,
      popoverClass: 'tour-popover',
      allowClose: true,
      doneBtnText: 'Got it',
      nextBtnText: 'Next',
      prevBtnText: 'Previous',
      onDestroyStarted: () => {
        if (typeof window !== 'undefined' && tourKeyRef.current) {
          localStorage.setItem(`tour_completed_${tourKeyRef.current}`, 'true');
        }
        driverRef.current?.destroy();
      },
    });

    driverRef.current.drive();
  }, []);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
    </TourContext.Provider>
  );
};
