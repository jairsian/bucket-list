import { Item } from './supabase';

export function generateICalEvent(item: Item): string {
  // Generate iCalendar format for a single event
  const calId = `bucket-list-${item.id}@example.com`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];

  // Use visit_date if available, otherwise use created_at
  let dtstart = item.created_at;
  if (item.visit_date) {
    dtstart = item.visit_date;
  }

  // Convert to iCal date format (YYYYMMDD for all-day, or YYYYMMDDTHHMMSSZ for timed)
  const dateStr = dtstart.split('T')[0].replace(/-/g, '');
  const dtStartLine = `DTSTART;VALUE=DATE:${dateStr}`;

  // End date is next day for all-day events
  const endDate = new Date(item.visit_date || item.created_at);
  endDate.setDate(endDate.getDate() + 1);
  const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
  const dtEndLine = `DTEND;VALUE=DATE:${endDateStr}`;

  // Build iCalendar
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bucket List App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${calId}`,
    `DTSTAMP:${now}Z`,
    dtStartLine,
    dtEndLine,
    `SUMMARY:${escapeICalText(item.title)}`,
    ...(item.description ? [`DESCRIPTION:${escapeICalText(item.description)}`] : []),
    ...(item.address ? [`LOCATION:${escapeICalText(item.address)}`] : []),
    ...(item.notes ? [`COMMENT:${escapeICalText(item.notes)}`] : []),
    ...(item.rating ? [`RATING:${item.rating}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

function escapeICalText(text: string): string {
  // Escape special characters for iCalendar format
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}
