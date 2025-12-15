import React, { useEffect, useRef, useState } from 'react';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import { useLogStore } from '@/lib/state';

interface VideoStageProps {
    videoEnabled: boolean;
    screenShareStream: MediaStream | null;
}

export default function VideoStage({ videoEnabled, screenShareStream }: VideoStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const { connected } = useLiveAPIContext();
  const [error, setError] = useState<string | null>(null);

  // Optimized selection: Select only what is needed directly.
  // We use separate selectors to ensure stability.
  const latestTurn = useLogStore(state => state.turns.at(-1));
  const captionText = latestTurn ? latestTurn.text : '';
  const isInterim = latestTurn ? !latestTurn.isFinal : false;
  
  // Truncate logic for subtitles to prevent it from covering the whole screen
  // Show only the last 200 characters if it gets too long
  const MAX_CAPTION_LENGTH = 200;
  const displayText = captionText.length > MAX_CAPTION_LENGTH 
    ? '...' + captionText.slice(-MAX_CAPTION_LENGTH) 
    : captionText;

  // Webcam Logic
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startVideo = async () => {
      setError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error('Error accessing webcam:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             setError("Camera permission denied");
        } else {
             setError("Camera unavailable");
        }
      }
    };

    if (videoEnabled) {
      startVideo();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoEnabled]);

  // Screen Share Logic
  useEffect(() => {
    if (screenRef.current && screenShareStream) {
        screenRef.current.srcObject = screenShareStream;
    }
  }, [screenShareStream]);

  return (
    <div className="main-stage">
      <div className="video-wrapper">
        {screenShareStream ? (
            <video
                ref={screenRef}
                autoPlay
                playsInline
                muted
                className="screen-share-feed"
            />
        ) : (
            <>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="video-feed" 
                    style={{ opacity: videoEnabled && !error ? 1 : 0 }}
                />
                {(!videoEnabled || error) && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
                        color: '#555', gap: '10px'
                    }}>
                        <span className="material-symbols-outlined" style={{fontSize: 48, opacity: 0.5}}>
                            {error ? 'videocam_off' : 'videocam_off'}
                        </span>
                    </div>
                )}
            </>
        )}
        
        <div className="host-label">
            {screenShareStream ? 'Jane Smith (Presenting)' : 'Jane Smith (You)'}
        </div>

        {/* Live Captioning Overlay (YouTube Style) */}
        {(displayText && connected) && (
            <div className="captions-overlay">
                <div className={`caption-bubble ${isInterim ? 'interim' : ''}`}>
                    {displayText}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}