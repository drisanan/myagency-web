'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useTheme } from '@mui/material/styles';

type TourContextType = {
  startTour: (tourKey: string, steps: Step[]) => void;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within a TourProvider');
  return ctx;
}

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tourKey, setTourKey] = useState<string>('');

  const tourStyles: Partial<Styles> = {
    options: {
      zIndex: 9999,
      primaryColor: theme.palette.primary.main,
      backgroundColor: theme.palette.background.paper,
      textColor: theme.palette.text.primary,
    },
    buttonNext: {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      fontWeight: 600,
    },
  };

  const startTour = useCallback((key: string, tourSteps: Step[]) => {
    const done = typeof window !== 'undefined' ? localStorage.getItem(`tour_completed_${key}`) : null;
    if (done) return;
    setTourKey(key);
    setSteps(tourSteps);
    setRun(true);
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const finished = [STATUS.FINISHED, STATUS.SKIPPED];
    if ((finished as string[]).includes(data.status)) {
      setRun(false);
      if (tourKey && typeof window !== 'undefined') {
        localStorage.setItem(`tour_completed_${tourKey}`, 'true');
        // TODO: persist to user profile via API if desired
      }
    }
  };

  return (
    <TourContext.Provider value={{ startTour }}>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        styles={tourStyles}
        callback={handleCallback}
        disableOverlayClose
        locale={{ last: 'Got it', skip: 'Skip Tour' }}
      />
      {children}
    </TourContext.Provider>
  );
};

