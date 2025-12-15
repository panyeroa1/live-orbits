import React, { useEffect, useState, useRef } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { useUI, useSettings } from '@/lib/state';
import { useWebSpeech } from '@/hooks/use-web-speech';

type ControlBarProps = {
    onToggleParticipants: () => void;
    participantsOpen: boolean;
    videoOn: boolean;
    setVideoOn: (on: boolean) => void;
    micOn: boolean;
    setMicOn: (on: boolean) => void;
    screenShareStream: MediaStream | null;
    setScreenShareStream: (stream: MediaStream | null) => void;
};

export default function ControlBar({ 
    onToggleParticipants, 
    participantsOpen,
    videoOn,
    setVideoOn,
    micOn,
    setMicOn,
    screenShareStream,
    setScreenShareStream
}: ControlBarProps) {
  const { connected, connect, disconnect } = useLiveAPIContext();
  const { toggleSidebar } = useUI();
  const { voice, setVoice } = useSettings();
  const [shareSystemAudio, setShareSystemAudio] = useState(false);

  // Use Web Speech API for transcription and get analyser for visualization
  const { analyserNode } = useWebSpeech(micOn && connected);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle connection toggle
  const handleAIConnect = () => {
    if (connected) {
        disconnect();
    } else {
        connect();
        // Ensure mic is on when starting AI, though user can toggle off
        if (!micOn) setMicOn(true); 
    }
  };

  const handleMuteToggle = () => {
      setMicOn(!micOn);
  };

  const handleVoiceToggle = () => {
      // Toggle between Aoede (Female) and Orus (Male)
      const newVoice = voice === 'Orus' ? 'Aoede' : 'Orus';
      setVoice(newVoice);
  };

  const handleScreenShare = async () => {
      if (screenShareStream) {
          // Stop sharing
          screenShareStream.getTracks().forEach(track => track.stop());
          setScreenShareStream(null);
      } else {
          try {
              const stream = await navigator.mediaDevices.getDisplayMedia({ 
                  video: true, 
                  audio: shareSystemAudio 
              });
              setScreenShareStream(stream);
              
              // Handle user stopping share via browser UI
              stream.getVideoTracks()[0].onended = () => {
                  setScreenShareStream(null);
              };
          } catch (err) {
              console.error("Error sharing screen:", err);
          }
      }
  };

  // Audio visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode || !micOn || !connected) {
      // Clear canvas if no analyser
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserNode.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00d9ff';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [analyserNode, micOn, connected]);

  return (
    <div className="control-bar">
        <div className="controls-left">
            <div className={`ai-status`}>
                <div className={`ai-dot ${connected ? 'connected' : ''}`}></div>
                {connected ? 'AI Active' : 'Offline'}
            </div>
            
            {/* Audio Visualizer */}
            {micOn && connected && (
                <div className="mic-visualizer-container">
                    <canvas 
                        ref={canvasRef} 
                        className="mic-visualizer"
                        width={128}
                        height={32}
                    />
                </div>
            )}
        </div>

        <div className="controls-center">
            <button className={`control-btn ${!micOn ? 'active' : ''}`} onClick={handleMuteToggle}>
                <span className="material-symbols-outlined">
                    {!micOn ? 'mic_off' : 'mic'}
                </span>
                <span>Mute</span>
            </button>
            
            <button className={`control-btn ${!videoOn ? 'active' : ''}`} onClick={() => setVideoOn(!videoOn)}>
                <span className="material-symbols-outlined">
                    {videoOn ? 'videocam' : 'videocam_off'}
                </span>
                <span>Video</span>
            </button>
            
            <button 
                className={`control-btn ${shareSystemAudio ? 'active' : ''}`} 
                onClick={() => setShareSystemAudio(!shareSystemAudio)}
                title="Include System Audio in Screen Share"
            >
                 <span className="material-symbols-outlined">
                    {shareSystemAudio ? 'volume_up' : 'volume_off'}
                </span>
                <span>Sys Audio</span>
            </button>

            <button 
                className={`control-btn`} 
                onClick={handleVoiceToggle}
                title={`Current Voice: ${voice}`}
            >
                 <span className="material-symbols-outlined">
                    {voice === 'Orus' ? 'man' : 'woman'}
                </span>
                <span>{voice === 'Orus' ? 'Male' : 'Female'}</span>
            </button>

            <button className={`control-btn ${screenShareStream ? 'active' : ''}`} onClick={handleScreenShare}>
                <span className="material-symbols-outlined">
                    {screenShareStream ? 'stop_screen_share' : 'present_to_all'}
                </span>
                <span>Share</span>
            </button>

            <button className={`control-btn ${participantsOpen ? 'active' : ''}`} onClick={onToggleParticipants}>
                <span className="material-symbols-outlined">group</span>
                <span>People</span>
            </button>

            <button className={`control-btn ${connected ? 'active connected-active' : ''}`} onClick={handleAIConnect}>
                <span className="material-symbols-outlined">
                    hearing
                </span>
                <span>{connected ? 'Listening' : 'Listen'}</span>
            </button>

            <button className="control-btn" onClick={toggleSidebar}>
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
            </button>
        </div>

        <div className="controls-right">
            <button className="leave-btn" onClick={() => window.location.reload()}>
                Leave
            </button>
        </div>
    </div>
  );
}