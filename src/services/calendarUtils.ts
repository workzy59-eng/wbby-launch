import { format, parseISO, addHours } from 'date-fns';
import { Meeting } from '../types';

export const generateGoogleCalendarUrl = (meeting: Meeting, attendees: string[] = []): string => {
  const startDateTime = `${meeting.date.replace(/-/g, '')}T${meeting.time.replace(':', '')}00`;
  const startDate = parseISO(`${meeting.date}T${meeting.time}`);
  const endDate = addHours(startDate, (meeting.duration || 60) / 60);
  const endDateTime = format(endDate, "yyyyMMdd'T'HHmmss");

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title,
    details: `${meeting.notes || ''}\n\nJoin Link: ${meeting.meetingLink}`,
    location: meeting.meetingLink,
    dates: `${startDateTime}/${endDateTime}`,
  });

  if (attendees.length > 0) {
    params.append('add', attendees.join(','));
  }

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

export const generateOutlookCalendarUrl = (meeting: Meeting, attendees: string[] = []): string => {
  const startDate = parseISO(`${meeting.date}T${meeting.time}`);
  const endDate = addHours(startDate, (meeting.duration || 60) / 60);
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: meeting.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `${meeting.notes || ''}\n\nJoin Link: ${meeting.meetingLink}`,
    location: meeting.meetingLink,
  });

  if (attendees.length > 0) {
    params.append('to', attendees.join(';'));
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

export const downloadIcsFile = (meeting: Meeting, attendees: string[] = []) => {
  const startDate = parseISO(`${meeting.date}T${meeting.time}`);
  const endDate = addHours(startDate, (meeting.duration || 60) / 60);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const attendeeLines = attendees.map(email => `ATTENDEE;RSVP=TRUE:mailto:${email}`);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WebbyLaunch//Meeting Scheduler//EN',
    'BEGIN:VEVENT',
    `UID:${meeting.id}@webbylaunch.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${(meeting.notes || '').replace(/\n/g, '\\n')}\\n\\nJoin Link: ${meeting.meetingLink}`,
    `LOCATION:${meeting.meetingLink}`,
    ...attendeeLines,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${meeting.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
