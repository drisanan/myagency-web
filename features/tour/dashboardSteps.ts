import { Step } from 'react-joyride';

export const dashboardSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to your Agency Dashboard! Let’s take a quick look around.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '#metrics-cards',
    content: 'Your key metrics at a glance.',
  },
  {
    target: '[data-tour="calendar-widget"]',
    content: 'Upcoming tasks and reminders appear here.',
  },
  {
    target: '[data-tour="commits-section"]',
    content: 'Recent commits and activity are surfaced in these sections.',
  },
];

