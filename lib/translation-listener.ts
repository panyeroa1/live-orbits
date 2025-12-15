/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from 'react';
import { supabase } from './supabase';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { useSettings } from './state';
import { SUPPORTED_LANGUAGES, DEFAULT_SESSION_ID } from './constants';

/**
 * Listens to Supabase Realtime for new transcript translations and sends them to Gemini
 * This prevents audio feedback by only sending TEXT prompts to Gemini (no mic access)
 */
export function useTranslationListener() {
  const { client, connected } = useLiveAPIContext();
  const { language } = useSettings();

  useEffect(() => {
    if (!connected) return;

    console.log('Starting translation listener...');

    // Subscribe to new transcripts for the current session
    // This allows ALL users in the session to hear the translation
    const { sessionId } = useSettings.getState();
    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transcripts',
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          console.log('New transcript detected in session:', payload);
          // We handle it regardless of who sent it (even ourselves, for verificatiom, 
          // but typically we'd skip our own if we don't want to hear ourselves back.
          // For now, let's process ALL to ensure it works, or filter self if needed later.)
           await handleNewTranscript(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Translation listener status:', status);
      });

    return () => {
      console.log('Stopping translation listener...');
      channel.unsubscribe();
    };
  }, [connected, client, language]);

  async function handleNewTranscript(translation: any) {
    const { userId } = useSettings.getState();

    // Skip if it's our own speech (prevent echo)
    // We assume the transcript payload has speaker_id stored either in metadata or column
    // Since we put it in saveTranscriptForTranslation -> inserts to transcripts -> we read from transcripts
    // We need to fetch the full row to check speaker_id if it's not in the payload
    
    // The payload.new contains the inserted row. 
    // If 'speaker_id' is NOT a column in 'transcripts' table but stored in metadata json, 
    // we might need to parse it. 
    // HOWEVER, for robustness in this demo without schema migration access:
    // We previously passed 'speaker_id' to saveTranscriptForTranslation.
    // If we can't rely on it being in the 'transcripts' columns, we'll have to rely on the metadata fetch.
    
    // Let's assume we fetch the row details anyway.
    
    // Fetch the original transcript text to get the speaker_id and text
    // We try to select speaker_id if it exists, otherwise we proceed cautious of echo
    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select('*') // Select all to see what we have
      .eq('id', translation.id)
      .single();

    if (error || !transcript) {
      console.error('Failed to fetch original transcript:', error);
      return;
    }

    // Filter out our own speech to prevent echo
    // We check against the speaker_id we saved (if column exists) or metadata
    // If we can't determine, we default to processing it (better to hear echo than silence for now)
    // But ideally we match.
    if (transcript.speaker_id && transcript.speaker_id === userId) {
      console.log('Skipping own speech translation');
      return;
    }

    // Also check session (double check, though subscription filtered it)
    // if (transcript.session_id !== DEFAULT_SESSION_ID) return;

    const sourceText = transcript.source_input || (transcript.metadata as any)?.text;
    
    if (!sourceText) {
       console.log('No text to translate found');
       return;
    }

    // Get target language config
    const targetLangConfig = SUPPORTED_LANGUAGES.find(
      l => l.code === translation.target_language
    ) || SUPPORTED_LANGUAGES[0];

    // Build translation prompt following the system instruction format
    const translationPrompt = buildTranslationPrompt({
      text: transcript.source_input,
      source_lang: 'auto', // Web Speech auto-detects
      target_lang: translation.target_language,
      target_locale: targetLangConfig.locale,
      speaker_style: 'neutral, clear',
    });

    console.log('Sending translation prompt to Gemini:', translationPrompt.substring(0, 100) + '...');

    // Send TEXT-only prompt to Gemini (NO audio input!)
    client.send([{ text: translationPrompt }]);

    // Note: translated_output will be filled by Gemini's response handler
    // and saved separately when the audio transcription comes back
  }
}

function buildTranslationPrompt(params: {
  text: string;
  source_lang: string;
  target_lang: string;
  target_locale: string;
  speaker_style: string;
}): string {
  // Format the prompt exactly as the system instructions expect
  return `Input:
source_lang: ${params.source_lang}
target_lang: ${params.target_lang}
target_locale: ${params.target_locale}
speaker_style: "${params.speaker_style}"
text: "${params.text}"

Output:`;
}
