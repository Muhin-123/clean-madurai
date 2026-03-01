import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pejxzwpzgmlcwyadtciw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanh6d3B6Z21sY3d5YWR0Y2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNDA0MTUsImV4cCI6MjA4NzkxNjQxNX0.7-uXGYtDYXXcWfd1EIIqM9wZApWR0nsJHC2lCTaNtGs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param {File} file - The file to upload
 * @param {string} folderName - Folder in the bucket (e.g., 'complaints')
 * @returns {Promise<string|null>} - Public URL of the uploaded file
 */
export const uploadToSupabase = async (file, folderName = 'complaints') => {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('complaints')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Supabase Upload Error: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('complaints')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Failed to get public URL from Supabase');
    }

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadToSupabase:', error);
    throw error;
  }
};
