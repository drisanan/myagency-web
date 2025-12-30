import { DriveStep } from 'driver.js';

export const recruiterSteps: DriveStep[] = [
  {
    popover: {
      title: 'Recruiter Wizard',
      description: 'Send personalized recruiting emails to college coaches in just a few steps.',
    },
  },
  {
    element: '[data-tour="wizard-stepper"]',
    popover: {
      title: 'Wizard Steps',
      description: 'Follow these steps: select athlete, choose coaches, customize your message, and send.',
    },
  },
  {
    element: '[data-tour="client-selector"]',
    popover: {
      title: 'Select Athlete',
      description: 'Choose which athlete you\'re recruiting for.',
    },
  },
];

