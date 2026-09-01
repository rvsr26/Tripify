/**
 * VoiceInput — microphone button with visual feedback.
 * Uses the useVoice hook (Web Speech API).
 * When recording stops, calls onTranscript with the final text.
 */
import React, { useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';

export default function VoiceInput({ onTranscript, disabled = false }) {
  const {
    isListening, displayText, isSupported,
    startListening, stopListening, resetTranscript,
  } = useVoice({
    onFinalTranscript: (text) => {
      if (text.trim() && onTranscript) onTranscript(text.trim());
    },
  });

  if (!isSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={handleClick}
        disabled={disabled}
        title={isListening ? 'Click to stop recording' : 'Click to speak your trip plan'}
        style={{
          width: '52px', height: '52px',
          borderRadius: '50%',
          border: `2px solid ${isListening ? '#ef4444' : '#6366f1'}`,
          background: isListening
            ? 'radial-gradient(circle, #ef444433, #ef444411)'
            : 'radial-gradient(circle, #6366f133, #6366f111)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
          transition: 'all 0.2s ease',
          animation: isListening ? 'micPulse 1.2s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}
      >
        {isListening ? '⏹️' : '🎤'}
      </button>

      {isListening && displayText && (
        <div style={{
          background: '#1e1e2e',
          border: '1px solid #6366f144',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '0.82rem',
          color: '#e2e8f0',
          maxWidth: '300px',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <span style={{ color: '#94a3b8', marginRight: '6px' }}>🎤</span>
          {displayText}
        </div>
      )}

      <style>{`
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
