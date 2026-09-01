/**
 * useVoice — Web Speech API hook for voice-to-trip input.
 *
 * Returns:
 *   isListening     — mic is active
 *   transcript      — live partial + final transcript
 *   isSupported     — whether browser supports SpeechRecognition
 *   startListening  — begin recording
 *   stopListening   — end recording
 *   resetTranscript — clear
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function useVoice({ onFinalTranscript, language = 'en-US' } = {}) {
  const [isListening, setListening]  = useState(false);
  const [transcript, setTranscript]  = useState('');
  const [interimText, setInterim]    = useState('');
  const recognitionRef = useRef(null);

  const isSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous          = true;
    recognition.interimResults      = true;
    recognition.lang                = language;
    recognition.maxAlternatives     = 1;

    recognition.onresult = (event) => {
      let finalText   = '';
      let interimTxt  = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText  += event.results[i][0].transcript;
        } else {
          interimTxt += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        setTranscript(prev => {
          const next = (prev + ' ' + finalText).trim();
          return next;
        });
      }
      setInterim(interimTxt);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
      // Fire callback with final transcript
      setTranscript(t => {
        if (t && onFinalTranscript) onFinalTranscript(t);
        return t;
      });
    };

    recognition.onerror = (e) => {
      console.warn('[Voice] Recognition error:', e.error);
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    setTranscript('');
    setInterim('');
    setListening(true);
    try { recognitionRef.current.start(); } catch { /* already started */ }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterim('');
  }, []);

  return {
    isListening,
    transcript,
    interimText,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    displayText: (transcript + (interimText ? ' ' + interimText : '')).trim(),
  };
}
