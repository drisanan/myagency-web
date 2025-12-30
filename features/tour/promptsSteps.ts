import { DriveStep } from 'driver.js';

export const promptsSteps: DriveStep[] = [
  {
    popover: {
      title: 'AI Prompts',
      description: 'Create and manage reusable AI prompts for generating personalized recruiting emails.',
    },
  },
  {
    element: '[data-tour="create-prompt-btn"]',
    popover: {
      title: 'Create Prompt',
      description: 'Click here to create a new AI prompt template.',
    },
  },
  {
    element: '[data-tour="prompts-list"]',
    popover: {
      title: 'Saved Prompts',
      description: 'Your saved prompts appear here. Select one to use in the Recruiter wizard.',
    },
  },
];

