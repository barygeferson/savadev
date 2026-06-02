import { LAUNCH_DATE } from './launchGate';

// Format a Date as YYYYMMDDTHHmmssZ in UTC
function fmt(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function getGoogleCalendarUrl(opts?: { title?: string; details?: string; durationMinutes?: number }) {
  const start = LAUNCH_DATE;
  const end = new Date(start.getTime() + (opts?.durationMinutes ?? 60) * 60_000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts?.title ?? 'sdev — Official launch',
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts?.details ?? 'sdev launches officially. Visit https://web.sdev.codes',
    location: 'https://web.sdev.codes',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Universal .ics fallback as a data URL (works with Apple Calendar, Outlook, etc.)
export function getIcsDataUrl(opts?: { title?: string; details?: string; durationMinutes?: number }) {
  const start = LAUNCH_DATE;
  const end = new Date(start.getTime() + (opts?.durationMinutes ?? 60) * 60_000);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//sdev//launch//EN',
    'BEGIN:VEVENT',
    `UID:sdev-launch-2026@web.sdev.codes`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts?.title ?? 'sdev — Official launch'}`,
    `DESCRIPTION:${(opts?.details ?? 'sdev launches officially.').replace(/\n/g, '\\n')}`,
    'URL:https://web.sdev.codes',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
}
