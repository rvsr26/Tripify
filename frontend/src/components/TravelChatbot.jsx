import React, { useState, useEffect, useRef } from 'react';
import { featuresService } from '../api';
import { useLocation } from 'react-router-dom';

export default function TravelChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am Tripify AI. Unsure where to eat, what to pack, or how to get around? Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    // Try to guess context from URL
    const context = { path: location.pathname };
    if (location.pathname.startsWith('/trips/')) {
      context.tripId = location.pathname.split('/')[2];
    }

    try {
      const res = await featuresService.sendChatbotMsg(userText, context);
      setMessages(prev => [...prev, { role: 'ai', text: res.reply || 'I am not sure about that.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to my brain right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-widget-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {isOpen && (
        <div className="card chat-popover animate-fade-in" style={{ padding: 0, width: '340px', height: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-default)', marginBottom: '16px', transformOrigin: 'bottom right' }}>
          
          {/* Header */}
          <div style={{ background: 'var(--gradient-brand)', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '1.5rem', background: 'rgba(255,255,255,0.2)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>🤖</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Tripify AI</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} style={{ color: 'white', padding: '4px' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-document)' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                <div style={{
                  background: m.role === 'user' ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                  color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  maxWidth: '85%',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: '16px 16px 16px 2px' }}>
                  <span className="dot-typing">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '8px' }} onSubmit={handleSend}>
            <input 
              type="text" 
              className="input-field" 
              style={{ flex: 1, marginBottom: 0, borderRadius: 'var(--border-radius-full)', padding: '10px 16px' }}
              placeholder="Ask me anything..." 
              value={input} 
              onChange={e => setInput(e.target.value)} 
            />
            <button type="submit" disabled={!input.trim() || loading} style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', opacity: input.trim() ? 1 : 0.5 }}>
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Button Toggle */}
      <button 
        className="chatbot-widget-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Chatbot"
        style={{
          width: '56px', height: '56px', borderRadius: '50%', background: 'var(--card-bg)', border: '2px solid var(--brand-primary)', color: 'var(--brand-primary)', fontSize: '1.6rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
}
