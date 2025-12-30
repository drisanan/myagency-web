import { DriveStep } from 'driver.js';

export const clientListsSteps: DriveStep[] = [
  {
    popover: {
      title: 'Your Lists',
      description: 'View coach lists that your agency has shared with you.',
    },
  },
  {
    element: '[data-tour="client-lists"]',
    popover: {
      title: 'Shared Lists',
      description: 'These are the coach lists prepared for your recruiting journey.',
    },
  },
];

export const clientTasksSteps: DriveStep[] = [
  {
    popover: {
      title: 'Your Tasks',
      description: 'View tasks assigned to you by your agency.',
    },
  },
  {
    element: '[data-tour="client-tasks-list"]',
    popover: {
      title: 'Task List',
      description: 'Complete these tasks to stay on track with your recruiting goals.',
    },
  },
];

