/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useRef, useState } from 'react';
import { useLogStore, useSettings } from '@/lib/state';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { saveTranscript, saveTranscriptForTranslation } from '@/lib/supabase';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

export function useWebSpeech(isMicOn: boolean) {
  const { client, connected } = useLiveAPIContext();
  const recognitionRef = useRef<any>(null);
  const shouldBeOn = useRef(isMicOn);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync ref with prop
  useEffect(() => {
    shouldBeOn.current = isMicOn;
    if (recognitionRef.current) {
      if (isMicOn) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      } else {
        recognitionRef.current.stop();
      }
    }
  }, [isMicOn]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      console.warn('Web Speech API not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Web Speech started');
    };

    recognition.onend = () => {
      console.log('Web Speech ended');
      // Auto-restart if it's supposed to be on (keep-alive)
      if (shouldBeOn.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart speech recognition', e);
        }
      }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const { turns, addTurn, updateLastTurn } = useLogStore.getState();
      const lastTurn = turns[turns.length - 1];
      // Check if we can update the last turn (if it's a user turn and not final)
      const canUpdate = lastTurn && lastTurn.role === 'user' && !lastTurn.isFinal;

      if (finalTranscript) {
        if (canUpdate) {
          updateLastTurn({ text: finalTranscript, isFinal: true });
        } else {
          addTurn({ role: 'user', text: finalTranscript, isFinal: true });
        }

        // CHANGED: Save to Supabase for translation instead of sending directly to Gemini
        // This prevents audio feedback loops - Gemini will receive text prompts from Supabase
        const { language, userId } = useSettings.getState();
        const targetLangConfig = SUPPORTED_LANGUAGES.find(l => l.label === language) || SUPPORTED_LANGUAGES[0];
        
        saveTranscriptForTranslation(finalTranscript, {
          source_lang: 'auto', // Web Speech will detect
          target_lang: targetLangConfig.code,
          target_locale: targetLangConfig.locale,
          speaker_style: 'neutral, clear',
          speaker_id: userId,
          session_id: 'demo-session-v1', // Should match DEFAULT_SESSION_ID
        });
        
        // Keep log for history
        saveTranscript(finalTranscript, 'user');

      } else if (interimTranscript) {
        // For interim results, we replace the content of the current pending turn
        if (canUpdate) {
          updateLastTurn({ text: interimTranscript });
        } else {
          addTurn({ role: 'user', text: interimTranscript, isFinal: false });
        }
      }
    };

    recognitionRef.current = recognition;

    // Start immediately if mic is on during mount
    if (shouldBeOn.current) {
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition', e);
      }
    }

    return () => {
      // Cleanup: remove onend to prevent restart loop and stop
      recognition.onend = null;
      recognition.stop();
    };
  }, [client]); // client is stable

  // Set up microphone stream and analyser for visualization
  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    async function setupAudioAnalyser() {
      try {
        // Request microphone access with AEC
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        });
        setMicStream(stream);

        // Create audio context and analyser
        audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        // Connect microphone to analyser
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        setAnalyserNode(analyser);
        console.log('Audio analyser setup complete');
      } catch (error) {
        console.error('Failed to setup audio analyser:', error);
      }
    }

    if (isMicOn && connected) {
      setupAudioAnalyser();
    }

    return () => {
      // Cleanup audio resources
      if (source) {
        source.disconnect();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      setAnalyserNode(null);
      setMicStream(null);
      audioContextRef.current = null;
    };
  }, [isMicOn, connected]);

  return { analyserNode, micStream };
}