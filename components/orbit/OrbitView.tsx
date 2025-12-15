import React, { useState } from 'react';
import VideoStage from './VideoStage';
import ControlBar from './ControlBar';
import ParticipantsList from './ParticipantsList';
import Sidebar from '../Sidebar'; // Re-using existing settings sidebar for configuration
import LiveConfig from './LiveConfig';
import { useUI } from '@/lib/state';

export default function OrbitView() {
  const [showParticipants, setShowParticipants] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const { isSidebarOpen } = useUI();

  return (
    <>
      <LiveConfig />
      <div className="orbit-header">
        <div className="window-dots">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
        </div>
        <span className="orbit-title">Orbit Premium</span>
        
        {screenShareStream && (
            <div className="screen-share-status">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>present_to_all</span>
                You are sharing your screen
            </div>
        )}
      </div>

      <div className="orbit-container">
        <VideoStage 
            videoEnabled={videoOn} 
            screenShareStream={screenShareStream}
        />
        <ParticipantsList collapsed={!showParticipants} />
      </div>

      <ControlBar 
        onToggleParticipants={() => setShowParticipants(!showParticipants)} 
        participantsOpen={showParticipants}
        videoOn={videoOn}
        setVideoOn={setVideoOn}
        micOn={micOn}
        setMicOn={setMicOn}
        screenShareStream={screenShareStream}
        setScreenShareStream={setScreenShareStream}
      />
      
      {/* Hidden configuration sidebar for AI settings, toggled by the gear icon in ControlBar */}
      <Sidebar /> 
    </>
  );
}