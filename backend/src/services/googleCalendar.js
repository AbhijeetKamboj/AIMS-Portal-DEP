import { google } from 'googleapis';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getAuthUrl = (state) => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
    state
  });
};

export const handleCallback = async (code, userId) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      const { error } = await supabaseAdmin
        .from('faculty_settings')
        .upsert({
          user_id: userId,
          google_refresh_token: tokens.refresh_token,
          calendar_sync_enabled: true
        });

      if (error) {
        console.error('[Google Calendar] DB error:', error.message);
      }
    }
  } catch (err) {
    console.error('[Google Calendar] Token exchange failed:', err.message);
    throw err;
  }
};

export const createEvent = async (userId, meetingDetails) => {
  // 1. Fetch refresh token
  const { data, error } = await supabaseAdmin
    .from('faculty_settings')
    .select('google_refresh_token')
    .eq('user_id', userId)
    .single();

  if (error || !data?.google_refresh_token) {
    console.error('[Google Calendar] No refresh token found');
    return null;
  }

  // 2. Auth
  oauth2Client.setCredentials({ refresh_token: data.google_refresh_token });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // 🔥 FINAL FIX: embed IST offset directly
  const startDateTime = `${meetingDetails.start_time}+05:30`;
  const endDateTime   = `${meetingDetails.end_time}+05:30`;

  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Meeting with ${meetingDetails.student_name} (AIMS)`,
        description: meetingDetails.reason,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime }
      }
    });

    return event.data.id;
  } catch (err) {
    console.error('[Google Calendar] Event creation failed:', err.response?.data || err.message);
    throw err;
  }
};

export const deleteEvent = async (userId, eventId) => {
  if (!eventId) return;

  const { data } = await supabaseAdmin
    .from('faculty_settings')
    .select('google_refresh_token')
    .eq('user_id', userId)
    .single();

  if (!data?.google_refresh_token) return;

  oauth2Client.setCredentials({ refresh_token: data.google_refresh_token });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });
  } catch (err) {
    console.error('[Google Calendar] Delete failed:', err.message);
  }
};
