import React from 'react';

export default function CoachChat() {
  return (
    <div className="screen active" style={{ display: 'flex' }}>
      {/* Top Bar */}
      <div className="topbar">
        <div style={{ width: '24px' }}></div>
        <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '16px' }}>AI Coach</div>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        
        {/* Bot Message */}
        <div className="msg-bot">
          <div className="avatar-sm">AI</div>
          <div className="bubble">
            Great job on hitting your protein goal yesterday! You are well recovered for Push Day today. Ready to crush it?
          </div>
        </div>
        
        {/* User Message */}
        <div className="msg-user">
          <div className="bubble">
            I'm a bit sore in my front delts. Should I skip the overhead press?
          </div>
        </div>
        
        {/* Bot Message */}
        <div className="msg-bot">
          <div className="avatar-sm">AI</div>
          <div className="bubble">
            Yes, it's best to avoid heavy overhead pressing if your front delts are sore. Let's substitute it with some lateral raises to isolate the side delts without stressing the front delts. I've updated your workout for today.
          </div>
        </div>
        
      </div>

      {/* Input Area (Fixed at bottom, just above bottom nav) */}
      <div className="chat-input-area" style={{ position: 'fixed', bottom: '80px', left: 0, width: '100%', padding: '16px', background: 'var(--bg)', borderTop: '1px solid var(--line)', display: 'flex', gap: '12px', boxSizing: 'border-box' }}>
        <input 
          type="text" 
          placeholder="Ask your coach anything..." 
          className="chat-input" 
          style={{ flex: 1, padding: '14px 20px', borderRadius: '100px', border: '1px solid var(--line)', outline: 'none', background: 'var(--white)', fontSize: '14px' }}
        />
        <button 
          className="chat-send" 
          style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--lime)', border: 'none', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={() => alert('Message Sent!')}
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20" style={{ transform: 'rotate(45deg) translateX(-2px) translateY(2px)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
      
    </div>
  );
}
