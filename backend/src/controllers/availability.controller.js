import { supabaseAdmin } from "../config/supabaseAdmin.js";

// Get my availability slots
export const getMyAvailability = async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from("faculty_availability")
        .select("*")
        .eq("faculty_id", req.user.id)
        .order("day_of_week")
        .order("start_time");

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Add availability slot
export const addAvailability = async (req, res) => {
    const { day_of_week, start_time, end_time, slot_duration } = req.body;

    // Validation
    if (day_of_week === undefined || !start_time || !end_time) {
        return res.status(400).json({ error: "day_of_week, start_time, end_time required" });
    }

    if (start_time >= end_time) {
        return res.status(400).json({ error: "End time must be after start time" });
    }

    const { data, error } = await supabaseAdmin
        .from("faculty_availability")
        .insert({
            faculty_id: req.user.id,
            day_of_week,
            start_time,
            end_time,
            slot_duration: slot_duration || 30
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({ error: "This time slot already exists" });
        }
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
};

// Update availability slot
export const updateAvailability = async (req, res) => {
    const { id } = req.params;
    const { start_time, end_time, slot_duration, is_active } = req.body;

    const updates = {};
    if (start_time) updates.start_time = start_time;
    if (end_time) updates.end_time = end_time;
    if (slot_duration) updates.slot_duration = slot_duration;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabaseAdmin
        .from("faculty_availability")
        .update(updates)
        .eq("id", id)
        .eq("faculty_id", req.user.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

// Delete availability slot
export const deleteAvailability = async (req, res) => {
    const { id } = req.params;

    const { error } = await supabaseAdmin
        .from("faculty_availability")
        .delete()
        .eq("id", id)
        .eq("faculty_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Availability slot deleted" });
};

export const getFacultySettings = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("faculty_settings")
            .select("calendar_sync_enabled")
            .eq("user_id", req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows found'

        res.json({
            calendar_sync_enabled: data?.calendar_sync_enabled || false
        });
    } catch (error) {
        console.error("Get Settings Error:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};

// Get available slots for a specific faculty on a date (for students)
export const getFacultySlots = async (req, res) => {
    const { faculty_id, date } = req.query;

    if (!faculty_id || !date) {
        return res.status(400).json({ error: "faculty_id and date are required" });
    }

    // Call DB function
    const { data, error } = await supabaseAdmin
        .rpc("get_available_slots", {
            p_faculty_id: faculty_id,
            p_date: date,
            p_slot_duration: 30
        });

    if (error) return res.status(400).json({ error: error.message });

    // Filter only available slots
    const availableSlots = (data || []).filter(s => s.is_available);
    res.json(availableSlots);
};

// Check for conflicts before booking
export const checkConflict = async (req, res) => {
    const { faculty_id, date, time, duration } = req.query;

    const { data, error } = await supabaseAdmin
        .rpc("check_meeting_conflict", {
            p_faculty_id: faculty_id,
            p_date: date,
            p_time: time,
            p_duration: duration || 30
        });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ hasConflict: data });
};
