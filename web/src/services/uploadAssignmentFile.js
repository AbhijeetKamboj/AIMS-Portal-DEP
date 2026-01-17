import { supabase } from "./supabaseClient";

export const uploadAssignmentFile = async (
  file,
  courseId,
  assignmentId,
  studentId
) => {
  try {
    const filePath = `${courseId}/${assignmentId}/${studentId}_${file.name}`;

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("assignments")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Get public URL (this is synchronous)
    const { data: urlData } = supabase.storage
      .from("assignments")
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error("Failed to get file URL");
    }

    return urlData.publicUrl;
  } catch (err) {
    console.error("Error in uploadAssignmentFile:", err);
    throw err;
  }
};
