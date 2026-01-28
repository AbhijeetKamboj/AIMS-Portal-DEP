import { google } from 'googleapis';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

export const getAuthUrl = (state) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial for refresh token
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent',
        state: state // Pass user ID
    });
};

export const handleCallback = async (code, userId) => {
    console.log(`[Google Calendar] Handling callback for user: ${userId}`);
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log(`[Google Calendar] Tokens received:`, {
            has_access_token: !!tokens.access_token,
            has_refresh_token: !!tokens.refresh_token,
            expiry_date: tokens.expiry_date
        });

        if (tokens.refresh_token) {
            // REMOVE updated_at to avoid schema cache issues in Supabase
            const { error } = await supabaseAdmin
                .from('faculty_settings')
                .upsert({
                    user_id: userId,
                    google_refresh_token: tokens.refresh_token,
                    calendar_sync_enabled: true
                });

            if (error) {
                console.error(`[Google Calendar] DB Error storing token:`, error.message);
            } else {
                console.log(`[Google Calendar] Refresh token stored successfully for user ${userId}`);
            }
        } else {
            console.warn(`[Google Calendar] No refresh token received. User might need to re-authorize with prompt=consent.`);
        }
    } catch (err) {
        console.error(`[Google Calendar] Error exchanging code for tokens:`, err.message);
        throw err;
    }
};

export const createEvent = async (userId, meetingDetails) => {
    console.log(`[Google Calendar] Creating event for user ${userId}...`);
    // 1. Get refresh token from DB
    const { data, error: dbError } = await supabaseAdmin
        .from('faculty_settings')
        .select('google_refresh_token')
        .eq('user_id', userId)
        .single();

    if (dbError || !data?.google_refresh_token) {
        console.error(`[Google Calendar] No refresh token found for user ${userId}`);
        return null;
    }

    // 2. Auth
    oauth2Client.setCredentials({ refresh_token: data.google_refresh_token });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    console.log(`[Google Calendar] Event Details:`, meetingDetails);

    // 3. Insert Event
    try {
        const event = await calendar.events.insert({
  calendarId: 'primary',
  requestBody: {
    summary: `Meeting with ${meetingDetails.student_name} (AIMS)`,
    description: meetingDetails.reason,
    start: {
      dateTime: `${meetingDetails.requested_date}T${meetingDetails.requested_time}:00+05:30`
    },
    end: {
      dateTime: `${meetingDetails.requested_date}T${meetingDetails.end_time}:00+05:30`
    }
  }
});


        console.log(`[Google Calendar] Event created successfully: ${event.data.id}`);
        return event.data.id;
    } catch (googleError) {
        console.error(`[Google Calendar] API Error:`, googleError.response?.data || googleError.message);
        throw googleError;
    }
};

export const deleteEvent = async (userId, eventId) => {
    if (!eventId) return;

    // 1. Get refresh token
    const { data } = await supabaseAdmin
        .from('faculty_settings')
        .select('google_refresh_token')
        .eq('user_id', userId)
        .single();

    if (!data?.google_refresh_token) return;

    // 2. Auth
    oauth2Client.setCredentials({ refresh_token: data.google_refresh_token });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 3. Delete
    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId
        });
    } catch (error) {
        console.error("Failed to delete Google Calendar event:", error.message);
    }
};
