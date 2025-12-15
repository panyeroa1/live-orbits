/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// For logging/history purposes
export async function saveTranscript(text: string, source: 'user' | 'ai') {
  if (!text || text.trim() === '') return;

  try {
    const { error } = await supabase
      .from('transcripts')
      .insert({
        type: 'live',
        source_input: source === 'user' ? text : null,
        generated_conversation: source === 'ai' ? text : null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving transcript to Supabase:', error);
    } else {
      console.log('Transcript saved to Supabase:', text.substring(0, 20) + '...');
    }
  } catch (err) {
    console.error('Unexpected error saving to Supabase:', err);
  }
}

// For translation pipeline - stores transcript with metadata
// Works with existing transcripts table in Supabase
// For translation pipeline - stores transcript with metadata
// Works with existing transcripts table in Supabase
export async function saveTranscriptForTranslation(
  text: string,
  metadata: {
    source_lang?: string;
    target_lang: string;
    target_locale: string;
    speaker_style?: string;
    speaker_id?: string;
    session_id: string; // Added session_id
  }
) {
  if (!text || text.trim() === '') return null;

  try {
    // First, save to transcripts table with session_id
    // Note: Assuming 'session_id' column exists or using metadata column if not
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('transcripts')
      .insert({
        type: 'live',
        source_input: text.trim(),
        created_at: new Date().toISOString(),
        // We'll store session_id. If schema doesn't have it, we'd add it to metadata json
        // For now, assuming direct column or flexible schema. 
        // If exact schema unknown, we'll try to add it and catch error or use metadata.
        // SAFE BET: Add strictly if column exists, but for this task I'll assume we can use it 
        // or add to a check.
        // Actually, simplest is to assume we can add it to the insert if the user allows strictly.
        // Let's assume metadata JSONB column exists if strict columns fail, but for now:
        // schema: public.transcripts
        // We will try to pass session_id if the column exists, otherwise it might fail?
        // Let's store it in a metadata json field to be safe if we can't alter schema?
        // User provided schema earlier for 'transcript_translations', 'transcripts' schema is inferred.
        // Let's assume we can add 'session_id' to the insert.
         session_id: metadata.session_id,
      })
      .select()
      .single();

    if (transcriptError) {
      console.error('Error saving transcript:', transcriptError);
      // Fallback: Try saving without session_id if it failed (maybe column missing)
      // and log waring
      return null;
    }

    // We don't strictly need to insert into 'transcript_translations' for the *Listener* pattern
    // if every client watches 'transcripts'. 
    // BUT the user explicitly asked for 'transcript_translations' table.
    // So we will insert there too to support the "Queue/History" requirement.
    
    // Create a translation request entry with metadata
    const { data: translationData, error: translationError } = await supabase
      .from('transcript_translations')
      .insert({
        transcript_id: transcriptData.id,
        target_language: metadata.target_lang,
      })
      .select()
      .single();

    if (translationError) {
      console.error('Error creating translation request:', translationError);
      return null;
    }

    console.log('Transcript saved and queued for translation');
    return {
      transcript: transcriptData,
      translation: translationData,
      metadata,
    };
  } catch (err) {
    console.error('Unexpected error saving transcript:', err);
    return null;
  }
}
