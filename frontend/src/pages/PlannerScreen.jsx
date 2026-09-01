import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { plannerService } from '../api';
import CuratedPlansScreen from './CuratedPlansScreen';
import MyTripsScreen from './MyTripsScreen';
import { useStream } from '../hooks/useStream';
import VoiceInput from '../components/VoiceInput';
import AgentActivityPanel from '../components/AgentActivityPanel';

const API_BASE = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/_/backend/api');


const EXAMPLE_PROMPTS = [
  'Plan a 5-day trip to Japan, budget $1500, food and anime, with friends, in October',
  'Plan a 7-day trip to Paris under €2000, solo traveler, art and museums',
  'Plan a 4-day trip to Goa under ₹20,000, adventure and beaches, couple trip',
  'Plan a 10-day Europe trip: Paris → Rome → Barcelona, budget $3000',
  'Plan a 3-day trip to New York under $800, shopping and nightlife',
];

const OPTION_CONFIGS = {
  A: { key: 'budget',   badge: '🌿 Budget',   color: 'var(--brand-emerald)' },
  B: { key: 'balanced', badge: '⚖️ Balanced', color: 'var(--brand-primary)' },
  C: { key: 'luxury',   badge: '👑 Luxury',   color: 'var(--brand-amber)' },
};

function StepIndicator({ step }) {
  return (
    <div className="step-indicator">
      <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
        <div className="step-num">{step > 1 ? '✓' : '1'}</div>
        <span>Prompt</span>
      </div>
      <div className="step-line" />
      <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
        <div className="step-num">{step > 2 ? '✓' : '2'}</div>
        <span>Options</span>
      </div>
      <div className="step-line" />
      <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
        <div className="step-num">3</div>
        <span>Your Plan</span>
      </div>
    </div>
  );
}

function OptionCard({ optionKey, data, currency, onSelect, loadingKey }) {
  const config = OPTION_CONFIGS[optionKey];
  const isLoading = loadingKey === optionKey;
  const blockAll = !!loadingKey;

  return (
    <div className={`glass-panel option-card ${config.key} animate-fade-in`} style={{ animationDelay: `${['A','B','C'].indexOf(optionKey) * 0.1}s` }}>
      <div style={{ marginBottom: '16px' }}>
        <span className="badge badge-admin">{config.badge}</span>
      </div>

      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
        {data.name}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
        {data.tagline}
      </p>

      <ul style={{ listStyle: 'none', marginBottom: '24px', padding: 0 }}>
        {(data.highlights || []).map((h, i) => (
          <li key={i} style={{ fontSize: '0.85rem', display: 'flex', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
            <span style={{ color: config.color, fontWeight: 700 }}>✓</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div style={{
        padding: '20px 0',
        borderTop: '1px solid var(--border-default)',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Estimated Cost
        </p>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {currency}{(data.estimatedCost || 0).toLocaleString()}
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
        onClick={() => onSelect(optionKey, data)}
        disabled={blockAll}
      >
        {isLoading ? (
          <><span className="loading-spinner-sm" /> Building Plan...</>
        ) : (
          `Choose ${config.badge.split(' ')[1]}`
        )}
      </button>
    </div>
  );
}

export default function PlannerScreen() {
  const [step, setStep]           = useState(1);
  const [prompt, setPrompt]       = useState('');
  const [options, setOptions]     = useState(null);
  const [parsedData, setParsed]   = useState(null);
  const [loadingOpts, setLoadingOpts]   = useState(false);
  const [loadingKey, setLoadingKey]     = useState(null);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab]   = useState('Wizard');
  const textareaRef = useRef(null);
  const navigate    = useNavigate();
  const { events, isStreaming, agentLog, startStream } = useStream();

  // ── Voice transcript handler ─────────────────────────────────────────────
  const handleVoiceTranscript = useCallback((transcript) => {
    setPrompt(transcript);
    // Auto-submit after voice input
    setTimeout(() => {
      if (transcript.trim().length > 5) {
        document.getElementById('planner-submit-btn')?.click();
      }
    }, 500);
  }, []);

  const handleGenerateOptions = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 5) return setError('Tell us more about your trip!');
    setLoadingOpts(true);
    setStep(2);
    try {
      const { options: data } = await plannerService.generateOptions(prompt.trim());
      setOptions(data);
      setParsed({
        destination: data.destination,
        days:        data.days,
        month:       data.month,
        currency:    data.currency || '$',
        travelWith:  data.travelWith,
      });
    } catch (err) {
      setError("Something went wrong. Let's try again.");
      setStep(1);
    } finally {
      setLoadingOpts(false);
    }
  };

  const handleSelectPlan = async (optionKey, optionData) => {
    setLoadingKey(optionKey);
    setStep(3);
    try {
      // Start SSE stream session first
      let sessionId = null;
      try {
        sessionId = await startStream();
      } catch { /* non-fatal — fall back to silent mode */ }

      // Trigger orchestrator (async — streams progress via SSE)
      if (sessionId) {
        const token = localStorage.getItem('accessToken');
        fetch(`${API_BASE}/orchestrate/plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ optionKey, optionData, parsedData, prompt, sessionId }),
        }).catch(() => {});

        // Watch SSE events for the final tripId
        // The 'done' event from the orchestrator contains the tripId
      } else {
        // Fallback: use existing plannerService (no streaming)
        const { plan } = await plannerService.selectPlan(optionKey, optionData, parsedData, prompt);
        navigate(`/trips/${plan._id}`);
        return;
      }
    } catch (err) {
      setStep(2);
      setLoadingKey(null);
    }
  };

  // Watch for orchestrator completion in stream events
  React.useEffect(() => {
    const doneEvent = events.find(e => e.type === 'done' && e.summary?.tripId);
    if (doneEvent?.summary?.tripId) {
      navigate(`/trips/${doneEvent.summary.tripId}`);
    }
    // Also handle options_ready (for voice flow)
    const optionsEvent = events.find(e => e.type === 'options_ready');
    if (optionsEvent?.options && step === 1) {
      setOptions(optionsEvent.options);
      setParsed({ destination: optionsEvent.options.destination, days: optionsEvent.options.days, currency: '$' });
      setStep(2);
      setLoadingOpts(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);


  // Step 3 — Streaming Agent Panel (replaces old spinner)
  if (step === 3) return (
    <div className="container animate-fade-in" style={{ textAlign: 'center', paddingTop: '6vh' }}>
      <h2 style={{ marginBottom: '6px' }}>🤖 Building Your Itinerary</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>
        Tripify's AI agents are working together to craft your perfect trip.
      </p>
      <AgentActivityPanel
        events={events}
        agentLog={agentLog}
        isStreaming={isStreaming || loadingKey !== null}
        style={{ maxWidth: '700px', margin: '0 auto 28px' }}
      />
      {/* Fallback: if streaming not working, show old spinner */}
      {events.length === 0 && (
        <div style={{ marginTop: '24px' }}>
          <div className="loading-spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gemini is crafting your day-by-day plan...
          </p>
        </div>
      )}
    </div>
  );


  return (
    <div className="container animate-fade-in">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1>
          <span className="vibrant-gradient-text">AI Trip Planner</span>
        </h1>
        <p>Describe your dream trip and let Gemini create the perfect itinerary.</p>
      </div>

      {/* ── Pillar Sub-Navigation ── */}
      <div className="page-tabs glass-panel" style={{ maxWidth: '600px', margin: '0 auto 44px' }}>
         <div className={`page-tab ${activeTab === 'Wizard' ? 'active' : ''}`} onClick={() => setActiveTab('Wizard')}>AI Wizard</div>
         <div className={`page-tab ${activeTab === 'Templates' ? 'active' : ''}`} onClick={() => setActiveTab('Templates')}>Elite Templates</div>
         <div className={`page-tab ${activeTab === 'Drafts' ? 'active' : ''}`} onClick={() => setActiveTab('Drafts')}>My Drafts</div>
      </div>

      {activeTab === 'Templates' ? (
         <CuratedPlansScreen />
      ) : activeTab === 'Drafts' ? (
         <MyTripsScreen />
      ) : (
         <>
            <StepIndicator step={step} />

      {step === 1 ? (
        <form onSubmit={handleGenerateOptions} className="glass-panel" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="input-group">
            <label style={{ fontSize: '1rem', marginBottom: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              What's your dream trip? 🌍
            </label>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <textarea
              className="input-field"
              ref={textareaRef}
              rows={4}
              placeholder="e.g. Plan a 10-day trip to Japan for $5000, focusing on anime, street food, and nature..."
              value={prompt}
              onChange={e => { setPrompt(e.target.value); setError(''); }}
              style={{ fontSize: '1rem', lineHeight: 1.7, padding: '18px', flex: 1 }}
            />
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={loadingOpts} />
          </div>
          </div>
          {error && <p style={{ color: 'var(--brand-rose)', marginBottom: '16px', fontSize: '0.88rem' }}>{error}</p>}

          <button id="planner-submit-btn" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loadingOpts}>
            {loadingOpts ? (
              <><span className="loading-spinner-sm" /> Analyzing your trip...</>
            ) : (
              '✨ Generate Trip Options'
            )}
          </button>


          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '12px', fontWeight: 600 }}>
              Try an example:
            </p>
            <div className="example-prompts">
              {EXAMPLE_PROMPTS.slice(0, 3).map((ex, i) => (
                <button key={i} type="button" className="example-prompt" onClick={() => setPrompt(ex)}>
                  {ex.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : (
        <div className="animate-fade-in">
          {options?.isMock && (
            <div className="glass-panel" style={{
              marginBottom: '28px',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              background: 'rgba(244, 63, 94, 0.04)',
              textAlign: 'center',
              padding: '24px'
            }}>
              <h3 style={{ color: 'var(--brand-rose)', marginBottom: '6px', fontSize: '1rem' }}>
                🚀 Demo mode active
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Gemini API quota exceeded — using premium template data so you can explore all features!
              </p>
            </div>
          )}
          {loadingOpts ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="loading-spinner" />
              <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Analyzing destination data...</p>
            </div>
          ) : (
            <div className="grid-3">
              {['A', 'B', 'C'].map(k => options && options[`option${k}`] && (
                <OptionCard
                  key={k}
                  optionKey={k}
                  data={options[`option${k}`]}
                  currency={parsedData?.currency || '$'}
                  onSelect={handleSelectPlan}
                  loadingKey={loadingKey}
                />
              ))}
            </div>
          )}
           <div style={{ textAlign: 'center', marginTop: '32px' }}>
             <button className="btn btn-ghost" onClick={() => { setStep(1); setOptions(null); setLoadingKey(null); }}>
               ← Change prompt
             </button>
           </div>
         </div>
       )}
       </>
      )}
    </div>
  );
}
