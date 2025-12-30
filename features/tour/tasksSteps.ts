import { DriveStep } from 'driver.js';

export const tasksSteps: DriveStep[] = [
  {
    popover: {
      title: 'Tasks',
      description: 'Track and manage tasks for yourself and your athletes.',
    },
  },
  {
    element: '[data-tour="create-task-btn"]',
    popover: {
      title: 'Create Task',
      description: 'Click here to create a new task. You can assign it to an athlete.',
    },
  },
  {
    element: '[data-tour="tasks-list"]',
    popover: {
      title: 'Task List',
      description: 'View all tasks here. Filter by status or assignee.',
    },
  },
];

