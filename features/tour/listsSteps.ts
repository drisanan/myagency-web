import { DriveStep } from 'driver.js';

export const listsSteps: DriveStep[] = [
  {
    popover: {
      title: 'Coach Lists',
      description: 'Build targeted lists of college coaches for your recruiting campaigns.',
    },
  },
  {
    element: '[data-tour="list-filters"]',
    popover: {
      title: 'Filter Coaches',
      description: 'Select sport, division, and state to find relevant coaches.',
    },
  },
  {
    element: '[data-tour="school-selector"]',
    popover: {
      title: 'Select School',
      description: 'Choose a school to view its coaching staff.',
    },
  },
  {
    element: '[data-tour="save-list-btn"]',
    popover: {
      title: 'Save List',
      description: 'Save your selected coaches as a reusable list for the Recruiter.',
    },
  },
  {
    element: '[data-tour="saved-lists"]',
    popover: {
      title: 'Saved Lists',
      description: 'Your saved coach lists appear here. Use them in the Recruiter wizard.',
    },
  },
];

