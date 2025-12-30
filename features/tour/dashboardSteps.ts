import { DriveStep } from 'driver.js';

export const dashboardSteps: DriveStep[] = [
  {
    popover: {
      title: 'Welcome!',
      description: 'Welcome to your Agency Dashboard! Let\'s take a quick look around.',
    },
  },
  {
    element: '#metrics-cards',
    popover: {
      title: 'Metrics',
      description: 'Your key metrics at a glance.',
    },
  },
  {
    element: '[data-tour="calendar-widget"]',
    popover: {
      title: 'Calendar',
      description: 'Upcoming tasks and reminders appear here.',
    },
  },
  {
    element: '[data-tour="commits-section"]',
    popover: {
      title: 'Activity',
      description: 'Recent commits and activity are surfaced in these sections.',
    },
  },
];
