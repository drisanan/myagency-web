/**
 * Unit tests for Google Calendar Service
 */
import { meetingToCalendarEvent, getEventColor } from '../googleCalendar';
import type { CalendarEvent } from '../googleCalendar';

describe('googleCalendar service', () => {
  describe('meetingToCalendarEvent', () => {
    it('should convert a meeting with scheduledAt to CalendarEvent', () => {
      const meeting = {
        id: 'meeting-1',
        title: 'Team Standup',
        scheduledAt: 1705000000000, // Fixed timestamp
        duration: 30,
        description: 'Daily standup meeting',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        status: 'confirmed',
      };

      const result = meetingToCalendarEvent(meeting);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('meeting-1');
      expect(result?.title).toBe('Team Standup');
      expect(result?.description).toBe('Daily standup meeting');
      expect(result?.meetLink).toBe('https://meet.google.com/abc-defg-hij');
      expect(result?.source).toBe('platform');
      expect(result?.allDay).toBe(false);
    });

    it('should return null if scheduledAt is undefined', () => {
      const meeting = {
        id: 'meeting-2',
        title: 'Unscheduled Meeting',
        status: 'pending',
      };

      const result = meetingToCalendarEvent(meeting);

      expect(result).toBeNull();
    });

    it('should default duration to 60 minutes if not provided', () => {
      const scheduledAt = 1705000000000;
      const meeting = {
        id: 'meeting-3',
        title: 'Long Meeting',
        scheduledAt,
        status: 'confirmed',
      };

      const result = meetingToCalendarEvent(meeting);

      expect(result).not.toBeNull();
      const startTime = new Date(result!.start!).getTime();
      const endTime = new Date(result!.end!).getTime();
      const durationMs = endTime - startTime;
      
      // 60 minutes = 3600000 ms
      expect(durationMs).toBe(60 * 60 * 1000);
    });

    it('should use provided duration to calculate end time', () => {
      const scheduledAt = 1705000000000;
      const duration = 45; // 45 minutes
      const meeting = {
        id: 'meeting-4',
        title: 'Custom Duration Meeting',
        scheduledAt,
        duration,
        status: 'confirmed',
      };

      const result = meetingToCalendarEvent(meeting);

      expect(result).not.toBeNull();
      const startTime = new Date(result!.start!).getTime();
      const endTime = new Date(result!.end!).getTime();
      const durationMs = endTime - startTime;
      
      expect(durationMs).toBe(45 * 60 * 1000);
    });
  });

  describe('getEventColor', () => {
    const createEvent = (source: 'google' | 'platform'): CalendarEvent => ({
      id: 'test',
      title: 'Test Event',
      start: null,
      end: null,
      source,
    });

    it('should return Google blue for Google Calendar events', () => {
      const event = createEvent('google');
      const color = getEventColor(event);
      
      expect(color).toBe('#CCFF00');
    });

    it('should return green for confirmed platform meetings', () => {
      const event = createEvent('platform');
      const color = getEventColor(event, 'confirmed');
      
      expect(color).toBe('#CCFF00');
    });

    it('should return orange for pending platform meetings', () => {
      const event = createEvent('platform');
      const color = getEventColor(event, 'pending');
      
      expect(color).toBe('#FFB800');
    });

    it('should return red for declined platform meetings', () => {
      const event = createEvent('platform');
      const color = getEventColor(event, 'declined');
      
      expect(color).toBe('#FF3B3B');
    });

    it('should return gray for cancelled platform meetings', () => {
      const event = createEvent('platform');
      const color = getEventColor(event, 'cancelled');
      
      expect(color).toBe('#667085');
    });

    it('should return purple for platform meetings with no status', () => {
      const event = createEvent('platform');
      const color = getEventColor(event);
      
      expect(color).toBe('#CCFF00');
    });
  });
});
