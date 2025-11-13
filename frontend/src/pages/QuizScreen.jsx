import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { featuresService } from '../api';

const QUESTIONS = [
  {
    id: 'q1',
    text: "You have a free weekend. What's your instinct?",
    options: [
      { text: "Pack a tent and find the nearest mountain", type: "Adventurer" },
      { text: "Check out that new fusion restaurant downtown", type: "Foodie" },
      { text: "Book a spa resort and do absolutely nothing", type: "Luxury" },
      { text: "Wander a new city with no fixed plans", type: "Urban" }
    ]
  },
  {
    id: 'q2',
    text: "How do you handle your travel budget?",
    options: [
      { text: "If it's cheap, I'm there. Hostels and street food!", type: "Budget" },
      { text: "I save up for once-in-a-lifetime experiences", type: "Luxury" },
      { text: "I try to keep it balanced, but food gets my money", type: "Foodie" },
      { text: "I don't mind spending on a good guide or museum", type: "Culture" }
    ]
  },
  {
    id: 'q3',
    text: "What's in your backpack?",
    options: [
      { text: "Just the essentials and a good pair of boots", type: "Adventurer" },
      { text: "A nice camera and a city map", type: "Urban" },
      { text: "Snacks, a guidebook, and a phrasebook", type: "Culture" },
      { text: "Three outfit changes and skincare", type: "Luxury" }
    ]
  },
  {
    id: 'q4',
    text: "Your ideal evening on a trip...",
    options: [
      { text: "Campfire under the stars", type: "Adventurer" },
      { text: "A 5-course tasting menu", type: "Foodie" },
      { text: "A local theater show or live music", type: "Culture" },
      { text: "Meeting locals at a dive bar", type: "Urban" }
    ]
  },
  {
    id: 'q5',
    text: "Pick a travel companion:",
    options: [
      { text: "My adventurous best friend", type: "Adventurer" },
      { text: "Someone who knows the best restaurants", type: "Foodie" },
      { text: "A local historian or guide", type: "Culture" },
      { text: "I prefer to fly solo and see where the wind takes me", type: "Urban" }
    ]
  }
];

export default function QuizScreen() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const handleSelect = async (option) => {
    const newAnswers = [...answers, { question: QUESTIONS[currentQ].text, answer: option.text }];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setLoading(true);
      try {
        const res = await featuresService.submitQuiz(newAnswers);
        setResult(res.personality);
      } catch (e) {
        console.error('Quiz failed:', e);
        alert('Failed to generate your personality profile.');
      }
      setLoading(false);
    }
  };

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Tripify Travel Personality',
        text: `I'm a ${result.type}! ${result.tagline} 🌍 Find out your travel personality on Tripify!`,
        url: window.location.origin
      }).catch(console.error);
    } else {
      alert("Sharing isn't supported on this browser context.");
    }
  };

  if (loading) return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="loading-spinner" style={{ marginBottom: '24px' }} />
      <h2 style={{ fontSize: '1.4rem', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Analyzing your travel soul...
      </h2>
      <p style={{ color: 'var(--text-muted)' }}>The AI is generating your unique profile</p>
    </div>
  );

  if (result) return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4vh' }}>
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '0', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ background: `linear-gradient(135deg, ${result.color}, ${result.color}88)`, padding: '40px 20px', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>{result.emoji}</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', lineHeight: 1.2 }}>{result.type}</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500 }}>"{result.tagline}"</p>
        </div>
        
        <div style={{ padding: '32px 24px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            {result.description}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            {result.traits?.map(t => (
              <span key={t} className="tag" style={{ border: `1px solid ${result.color}44`, color: result.color }}>{t}</span>
            ))}
          </div>

          <div style={{ textAlign: 'left', background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--border-radius-md)', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              🌍 Ideal Destinations
            </h4>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{result.idealDestinations?.join(', ')}</p>
          </div>

          <div style={{ textAlign: 'left', background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--border-radius-md)', borderLeft: `4px solid ${result.color}` }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              💡 Top Tip
            </h4>
            <p style={{ fontSize: '0.9rem' }}>{result.travelTip}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <button className="btn btn-primary" onClick={shareResult}>
          📤 Share Profile
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Plan a Trip
        </button>
      </div>
    </div>
  );

  const q = QUESTIONS[currentQ];

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px', paddingTop: '6vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '24px' }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{ height: '4px', width: '32px', borderRadius: '2px', background: i <= currentQ ? 'var(--brand-primary)' : 'var(--border-default)', transition: 'background 0.3s ease' }} />
          ))}
        </div>
        <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--brand-primary)', fontWeight: 700 }}>
          Question {currentQ + 1} of {QUESTIONS.length}
        </span>
        <h1 style={{ fontSize: '1.8rem', marginTop: '12px' }}>{q.text}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            className="glass-panel animate-slide-up"
            style={{ padding: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', animationDelay: `${i * 0.05}s` }}
            onClick={() => handleSelect(opt)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none'; }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
