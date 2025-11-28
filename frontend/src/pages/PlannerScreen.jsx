import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { plannerService } from '../api';
import CuratedPlansScreen from './CuratedPlansScreen';
import MyTripsScreen from './MyTripsScreen';

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
      const { plan } = await plannerService.selectPlan(optionKey, optionData, parsedData, prompt);
      navigate(`/trips/${plan._id}`);
    } catch (err) {
      setStep(2);
      setLoadingKey(null);
    }
  };

  // Step 3 — Loading
  if (step === 3) return (
    <div className="container animate-fade-in" style={{ textAlign: 'center', paddingTop: '12vh' }}>
      <div className="loading-spinner" style={{ width: '48px', height: '48px', marginBottom: '28px' }} />
      <h2 style={{ marginBottom: '10px' }}>Gemini is building your itinerary...</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
        Crafting a custom map, packing list, and day-by-day plan. This takes about 10 seconds.
      </p>
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
            <textarea
              className="input-field"
              ref={textareaRef}
              rows={4}
              placeholder="e.g. Plan a 10-day trip to Japan for $5000, focusing on anime, street food, and nature..."
              value={prompt}
              onChange={e => { setPrompt(e.target.value); setError(''); }}
              style={{ fontSize: '1rem', lineHeight: 1.7, padding: '18px' }}
            />
          </div>
          {error && <p style={{ color: 'var(--brand-rose)', marginBottom: '16px', fontSize: '0.88rem' }}>{error}</p>}

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loadingOpts}>
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

// Build verification patch on 11/28/2025, 2:04:00 PM
