import React from 'react';

// Mock data to match screenshot
const MOCK_PARTICIPANTS = [
    { name: 'Jane Smith (Host)', isMe: true, image: null },
    { name: 'John Doe', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=John' },
    { name: 'Alex Johnson', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex' },
    { name: 'Bnedorsaniin', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bned' },
    { name: 'Data Smith', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Data' },
    { name: 'Shria Sonith', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Shria' },
    { name: 'Karian Iian', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karian' },
    { name: 'Andra Sesrin', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Andra' },
    { name: 'Alex Gomson', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Gomson' },
    { name: 'Jane Sarveen', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarveen' },
    { name: 'Alex Hason', isMe: false, image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hason' },
];

export default function ParticipantsList({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`right-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
            Participants ({MOCK_PARTICIPANTS.length})
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
        </div>
        <div className="participant-list">
            {MOCK_PARTICIPANTS.map((p, i) => (
                <div key={i} className="participant-item">
                    <div className="avatar">
                        {p.image ? (
                            <img src={p.image} alt={p.name} />
                        ) : (
                            // Placeholder for self/webcam user if we wanted to show it
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Jane`} alt="Me" />
                        )}
                    </div>
                    <div className="participant-info">
                        {p.name}
                    </div>
                    <div className="participant-status">
                         <span className="material-symbols-outlined mic-icon-small">mic_off</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}