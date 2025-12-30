import { DriveStep } from 'driver.js';

export const athletesSteps: DriveStep[] = [
  {
    popover: {
      title: 'Athletes',
      description: 'Manage your athletes from this page. Add new athletes, send intake forms, and view profiles.',
    },
  },
  {
    element: '[data-tour="add-athlete-btn"]',
    popover: {
      title: 'Add Athlete',
      description: 'Click here to manually add a new athlete to your roster.',
    },
  },
  {
    element: '[data-tour="invite-section"]',
    popover: {
      title: 'Invite Athletes',
      description: 'Generate an invite link to send to athletes. They can fill out their own intake form.',
    },
  },
  {
    element: '[data-tour="athletes-list"]',
    popover: {
      title: 'Athletes List',
      description: 'View and manage all your athletes here. Click on any athlete to see their full profile.',
    },
  },
];

