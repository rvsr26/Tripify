import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const TRIVIA_QUESTIONS = [
  { q: 'Which country has the most natural UNESCO World Heritage Sites?', options: ['China', 'USA', 'Australia', 'Brazil'], ans: 0 },
  { q: 'What is the smallest country in the world by area?', options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], ans: 2 },
  { q: 'Which city is known as the "City of a Thousand Minarets"?', options: ['Istanbul', 'Cairo', 'Baghdad', 'Tehran'], ans: 1 },
  { q: 'The Great Barrier Reef is located off the coast of which country?', options: ['Fiji', 'New Zealand', 'Australia', 'Indonesia'], ans: 2 },
  { q: 'Which river is the longest in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], ans: 1 },
  { q: 'Mount Kilimanjaro is located in which country?', options: ['Kenya', 'Ethiopia', 'Tanzania', 'Uganda'], ans: 2 },
  { q: 'What is the capital city of Canada?', options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], ans: 3 },
  { q: 'Which country invented the croissant?', options: ['France', 'Austria', 'Belgium', 'Switzerland'], ans: 1 },
  { q: 'The Colosseum is located in which city?', options: ['Athens', 'Madrid', 'Rome', 'Lisbon'], ans: 2 },
  { q: 'Which country has the most time zones?', options: ['USA', 'Russia', 'China', 'France'], ans: 3 },
  { q: 'The Sahara Desert spans how many countries?', options: ['6', '9', '11', '14'], ans: 2 },
  { q: 'Which country has the longest coastline?', options: ['USA', 'Norway', 'Canada', 'Australia'], ans: 2 },
  { q: 'The Maldives is located in which ocean?', options: ['Pacific', 'Atlantic', 'Arctic', 'Indian'], ans: 3 },
  { q: 'Which city is nicknamed "The Big Apple"?', options: ['Chicago', 'New York', 'Los Angeles', 'Miami'], ans: 1 },
  { q: 'Angkor Wat is located in which country?', options: ['Thailand', 'Vietnam', 'Cambodia', 'Myanmar'], ans: 2 },
];

const SCRAMBLE_WORDS = [
  { word: 'PASSPORT', hint: '🛂 You need this to cross borders' },
  { word: 'ITINERARY', hint: '📋 Your travel plan' },
  { word: 'HOSTEL', hint: '🛏️ Budget traveler\'s home' },
  { word: 'LANDMARK', hint: '📍 Famous place' },
  { word: 'CURRENCY', hint: '💸 Money used in a country' },
  { word: 'SUITCASE', hint: '🧳 Holds your clothes' },
  { word: 'BOARDING', hint: '✈️ Getting on the plane' },
  { word: 'TIMEZONE', hint: '⏰ Changes as you travel east/west' },
  { word: 'SOUVENIR', hint: '🎁 Memory from your trip' },
  { word: 'LAYOVER', hint: '⏱️ Waiting between flights' },
  { word: 'BACKPACK', hint: '🎒 Lightweight traveler\'s bag' },
  { word: 'CUSTOMS', hint: '🔍 Border checkpoint' },
  { word: 'BROCHURE', hint: '📄 Tourist info pamphlet' },
  { word: 'COMPASS', hint: '🧭 Points north' },
  { word: 'LUGGAGE', hint: '🧳 All your travel bags together' },
];

const FLAGS = [
  { emoji: '🇯🇵', name: 'Japan',          options: ['Japan', 'China', 'South Korea', 'Vietnam'] },
  { emoji: '🇧🇷', name: 'Brazil',         options: ['Argentina', 'Brazil', 'Colombia', 'Peru'] },
  { emoji: '🇩🇪', name: 'Germany',        options: ['Austria', 'Germany', 'Switzerland', 'Netherlands'] },
  { emoji: '🇮🇳', name: 'India',          options: ['Pakistan', 'Bangladesh', 'India', 'Sri Lanka'] },
  { emoji: '🇫🇷', name: 'France',         options: ['France', 'Italy', 'Spain', 'Portugal'] },
  { emoji: '🇨🇦', name: 'Canada',         options: ['USA', 'Canada', 'Australia', 'New Zealand'] },
  { emoji: '🇲🇽', name: 'Mexico',         options: ['Mexico', 'Guatemala', 'Colombia', 'Peru'] },
  { emoji: '🇿🇦', name: 'South Africa',   options: ['Nigeria', 'Kenya', 'South Africa', 'Egypt'] },
  { emoji: '🇦🇺', name: 'Australia',      options: ['Australia', 'New Zealand', 'Canada', 'Ireland'] },
  { emoji: '🇸🇦', name: 'Saudi Arabia',   options: ['UAE', 'Qatar', 'Kuwait', 'Saudi Arabia'] },
  { emoji: '🇳🇴', name: 'Norway',         options: ['Sweden', 'Denmark', 'Finland', 'Norway'] },
  { emoji: '🇦🇷', name: 'Argentina',      options: ['Chile', 'Uruguay', 'Argentina', 'Bolivia'] },
  { emoji: '🇹🇭', name: 'Thailand',       options: ['Thailand', 'Cambodia', 'Laos', 'Myanmar'] },
  { emoji: '🇳🇱', name: 'Netherlands',    options: ['Belgium', 'Luxembourg', 'Netherlands', 'Denmark'] },
  { emoji: '🇵🇹', name: 'Portugal',       options: ['Spain', 'Portugal', 'Italy', 'Greece'] },
];

const PACKING_ITEMS = {
  beach:     { items: ['Sunscreen', 'Swimsuit', 'Flip Flops', 'Beach Towel', 'Sunglasses', 'Snorkel', 'Hat', 'Sandals'], decoys: ['Winter Coat', 'Ski Boots', 'Thermal Socks', 'Snow Gloves', 'Umbrella'] },
  mountain:  { items: ['Hiking Boots', 'Rain Jacket', 'Compass', 'Thermal Socks', 'Tent', 'Headlamp', 'Trail Mix', 'First Aid Kit'], decoys: ['Bikini', 'Flip Flops', 'Sun Hat', 'Snorkel', 'Beach Towel'] },
  city:      { items: ['Camera', 'City Map', 'Comfortable Shoes', 'Umbrella', 'Metro Card', 'Phrasebook', 'Daypack', 'Power Bank'], decoys: ['Camping Tent', 'Hiking Boots', 'Snorkel', 'Ski Jacket', 'Fishing Rod'] },
  safari:    { items: ['Binoculars', 'Bug Spray', 'Safari Hat', 'Neutral Clothes', 'Sunscreen', 'First Aid Kit', 'Camera', 'Water Bottle'], decoys: ['Bathing Suit', 'Skiing Goggles', 'Ice Skates', 'Rain Boots', 'City Map'] },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function scramble(word) {
  const arr = word.split('');
  let s;
  do { s = shuffle(arr).join(''); } while (s === word);
  return s;
}

function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCOREBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function Scoreboard({ score, total, timeLeft, label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{score}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{total}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Round</div>
        </div>
      </div>
      {timeLeft !== undefined && (
        <div style={{
          fontSize: '1.6rem', fontWeight: 800,
          color: timeLeft <= 5 ? 'var(--brand-danger)' : timeLeft <= 10 ? 'var(--brand-amber)' : 'var(--brand-emerald)',
          transition: 'color 0.3s',
          minWidth: 40, textAlign: 'center',
        }}>
          ⏱ {timeLeft}s
        </div>
      )}
      {label && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  );
}

function ResultCard({ score, total, gameLabel, onRetry, onHome }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '😅';
  const msg = pct >= 80 ? 'Incredible! You\'re a travel genius!' : pct >= 50 ? 'Great job, world traveler!' : 'Keep exploring the world!';
  return (
    <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{emoji}</div>
      <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{msg}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{gameLabel}</p>
      <div style={{
        fontSize: '3rem', fontWeight: 900,
        background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
      }}>
        {score} / {total}
      </div>
      <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '36px' }}>
        {pct}% correct
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={onRetry}>🔄 Play Again</button>
        <button className="btn btn-outline" onClick={onHome}>🎮 Games Hub</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 1 — TRAVEL TRIVIA
// ─────────────────────────────────────────────────────────────────────────────

function TravelTrivia({ onBack, players }) {
  const ROUND_TIME = 20;
  const QUESTIONS = shuffle(TRIVIA_QUESTIONS).slice(0, 10);

  const [qi, setQi]         = useState(0);
  const [score, setScore]   = useState(() => Object.fromEntries(players.map(p => [p, 0])));
  const [chosen, setChosen] = useState(null);
  const [timeLeft, setTime] = useState(ROUND_TIME);
  const [phase, setPhase]   = useState('question'); // question | reveal | done
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const timerRef = useRef(null);

  const q = QUESTIONS[qi];
  const isMultiplayer = players.length > 1;

  const advance = useCallback(() => {
    clearInterval(timerRef.current);
    if (qi + 1 >= QUESTIONS.length) { setPhase('done'); return; }
    setQi(qi + 1);
    setChosen(null);
    setPhase('question');
    setTime(ROUND_TIME);
    if (isMultiplayer) setCurrentPlayer(p => (p + 1) % players.length);
  }, [qi, QUESTIONS.length, isMultiplayer, players.length]);

  const handleAnswer = useCallback((idx) => {
    if (phase !== 'question') return;
    clearInterval(timerRef.current);
    setChosen(idx);
    if (idx === q.ans) {
      const bonus = Math.ceil(timeLeft / 2);
      setScore(s => ({ ...s, [players[currentPlayer]]: (s[players[currentPlayer]] || 0) + 10 + bonus }));
    }
    setPhase('reveal');
    setTimeout(advance, 1800);
  }, [phase, q, timeLeft, players, currentPlayer, advance]);

  useEffect(() => {
    if (phase !== 'question') return;
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(-1); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qi]);

  if (phase === 'done') {
    const topScore = Math.max(...Object.values(score));
    const totalPossible = QUESTIONS.length * 10;
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Final Scores!</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {Object.entries(score).sort((a, b) => b[1] - a[1]).map(([name, pts], i) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', borderRadius: 'var(--border-radius-md)',
                background: i === 0 ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                border: i === 0 ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
              }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {name}</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--brand-primary)' }}>{pts} pts</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Play Again</button>
            <button className="btn btn-outline" onClick={onBack}>🎮 Games Hub</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <Scoreboard
        score={isMultiplayer ? `${players[currentPlayer]}'s turn` : Object.values(score)[0]}
        total={`Q${qi + 1}/${QUESTIONS.length}`}
        timeLeft={timeLeft}
      />

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'var(--border-default)', borderRadius: '2px', marginBottom: '28px', overflow: 'hidden' }}>
        <div style={{
          width: `${(timeLeft / ROUND_TIME) * 100}%`, height: '100%',
          background: timeLeft <= 5 ? 'var(--brand-danger)' : 'linear-gradient(90deg, #6366f1, #ec4899)',
          transition: 'width 1s linear',
        }} />
      </div>

      <div className="glass-panel" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
          🌍 Question {qi + 1} of {QUESTIONS.length}
        </div>
        <h2 style={{ fontSize: '1.3rem', lineHeight: 1.4, marginBottom: '24px' }}>{q.q}</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {q.options.map((opt, i) => {
            let bg = 'var(--bg-input)', border = 'var(--border-default)', color = 'var(--text-primary)';
            if (phase === 'reveal') {
              if (i === q.ans) { bg = 'rgba(16,185,129,0.15)'; border = 'var(--brand-emerald)'; color = 'var(--brand-emerald)'; }
              else if (i === chosen) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#ef4444'; }
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={phase === 'reveal'}
                style={{
                  padding: '18px', borderRadius: 'var(--border-radius-md)',
                  background: bg, border: `2px solid ${border}`, color,
                  cursor: phase === 'reveal' ? 'default' : 'pointer',
                  fontSize: '0.92rem', fontWeight: 600, textAlign: 'left',
                  transition: 'all 0.2s', lineHeight: 1.4,
                }}
                onMouseOver={e => { if (phase === 'question') e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                onMouseOut={e => { if (phase === 'question') e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multiplayer scores */}
      {isMultiplayer && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {players.map((p, i) => (
            <div key={p} style={{
              padding: '8px 16px', borderRadius: 'var(--border-radius-full)',
              background: i === currentPlayer ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
              border: `1px solid ${i === currentPlayer ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              fontSize: '0.82rem', fontWeight: i === currentPlayer ? 700 : 400,
            }}>
              {i === currentPlayer ? '▶ ' : ''}{p}: {score[p]} pts
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 2 — WORD SCRAMBLE
// ─────────────────────────────────────────────────────────────────────────────

function WordScramble({ onBack, players }) {
  const WORDS = shuffle(SCRAMBLE_WORDS).slice(0, 8);
  const [wi, setWi]           = useState(0);
  const [scrambled, setScram] = useState(() => scramble(WORDS[0].word));
  const [guess, setGuess]     = useState('');
  const [feedback, setFeed]   = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore]     = useState(() => Object.fromEntries(players.map(p => [p, 0])));
  const [done, setDone]       = useState(false);
  const [currentPlayer, setCurrent] = useState(0);
  const [shake, setShake]     = useState(false);
  const inputRef = useRef(null);

  const w = WORDS[wi];

  const handleGuess = () => {
    if (!guess.trim()) return;
    const correct = guess.trim().toUpperCase() === w.word;
    setFeed(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => ({ ...s, [players[currentPlayer]]: (s[players[currentPlayer]] || 0) + 10 }));
    else { setShake(true); setTimeout(() => setShake(false), 600); }
    setTimeout(() => {
      if (wi + 1 >= WORDS.length) { setDone(true); return; }
      setWi(wi + 1);
      setScram(scramble(WORDS[wi + 1].word));
      setGuess('');
      setFeed(null);
      if (players.length > 1) setCurrent(c => (c + 1) % players.length);
      inputRef.current?.focus();
    }, 1200);
  };

  const skip = () => {
    if (wi + 1 >= WORDS.length) { setDone(true); return; }
    setWi(wi + 1);
    setScram(scramble(WORDS[wi + 1].word));
    setGuess('');
    setFeed(null);
    if (players.length > 1) setCurrent(c => (c + 1) % players.length);
    inputRef.current?.focus();
  };

  const reshuffle = () => setScram(scramble(w.word));

  if (done) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Round Over!</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {Object.entries(score).sort((a, b) => b[1] - a[1]).map(([name, pts], i) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', borderRadius: 'var(--border-radius-md)',
                background: i === 0 ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                border: `1px solid ${i === 0 ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              }}>
                <span style={{ fontWeight: 700 }}>{['🥇', '🥈', '🥉'][i] || ''} {name}</span>
                <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{pts} pts</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Play Again</button>
            <button className="btn btn-outline" onClick={onBack}>🎮 Games Hub</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Word {wi + 1} of {WORDS.length}</span>
        {players.length > 1 && (
          <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.9rem' }}>
            🎮 {players[currentPlayer]}'s turn
          </span>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.entries(score).map(([name, pts]) => (
            <span key={name} style={{ fontSize: '0.78rem', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '20px' }}>
              {name}: {pts}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Unscramble the travel word</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', marginBottom: '24px' }}>Hint: {w.hint}</p>

        {/* Scrambled letters */}
        <div
          style={{
            display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: '32px',
            animation: shake ? 'shake 0.4s ease' : 'none',
          }}
        >
          <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
          {scrambled.split('').map((ch, i) => (
            <div key={i} style={{
              width: '48px', height: '52px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 800,
              background: feedback === 'correct' ? 'rgba(16,185,129,0.2)' : feedback === 'wrong' ? 'rgba(239,68,68,0.15)' : 'var(--bg-input)',
              border: `2px solid ${feedback === 'correct' ? 'var(--brand-emerald)' : feedback === 'wrong' ? '#ef4444' : 'var(--border-default)'}`,
              borderRadius: '10px',
              transition: 'all 0.3s',
              color: feedback === 'correct' ? 'var(--brand-emerald)' : feedback === 'wrong' ? '#ef4444' : 'var(--text-primary)',
            }}>
              {ch}
            </div>
          ))}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div style={{
            fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px',
            color: feedback === 'correct' ? 'var(--brand-emerald)' : '#ef4444',
          }}>
            {feedback === 'correct' ? `✅ Correct! +10 pts` : `❌ It was "${w.word}"`}
          </div>
        )}

        {/* Input */}
        {!feedback && (
          <>
            <input
              ref={inputRef}
              className="input-field"
              placeholder="Type your answer..."
              value={guess}
              onChange={e => setGuess(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 700, marginBottom: '16px' }}
              autoFocus
              maxLength={15}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleGuess} disabled={!guess.trim()}>✓ Submit</button>
              <button className="btn btn-outline btn-sm" onClick={reshuffle}>🔀 Reshuffle</button>
              <button className="btn btn-ghost btn-sm" onClick={skip}>Skip →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 3 — FLAG GUESSER
// ─────────────────────────────────────────────────────────────────────────────

function FlagGuesser({ onBack, players }) {
  const ROUNDS = shuffle(FLAGS).slice(0, 10);
  const [ri, setRi]           = useState(0);
  const [selected, setSelect] = useState(null);
  const [phase, setPhase]     = useState('guess');
  const [score, setScore]     = useState(() => Object.fromEntries(players.map(p => [p, 0])));
  const [currentPlayer, setCurrent] = useState(0);
  const [done, setDone]       = useState(false);

  const r = ROUNDS[ri];

  const handleChoice = (opt) => {
    if (phase !== 'guess') return;
    setSelect(opt);
    const correct = opt === r.name;
    if (correct) setScore(s => ({ ...s, [players[currentPlayer]]: (s[players[currentPlayer]] || 0) + 10 }));
    setPhase('reveal');
    setTimeout(() => {
      if (ri + 1 >= ROUNDS.length) { setDone(true); return; }
      setRi(ri + 1);
      setSelect(null);
      setPhase('guess');
      if (players.length > 1) setCurrent(c => (c + 1) % players.length);
    }, 1600);
  };

  if (done) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🌍</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Flags Done!</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {Object.entries(score).sort((a, b) => b[1] - a[1]).map(([name, pts], i) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between', padding: '16px 20px',
                borderRadius: 'var(--border-radius-md)',
                background: i === 0 ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                border: `1px solid ${i === 0 ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              }}>
                <span style={{ fontWeight: 700 }}>{['🥇', '🥈', '🥉'][i] || ''} {name}</span>
                <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{pts} pts</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Play Again</button>
            <button className="btn btn-outline" onClick={onBack}>🎮 Games Hub</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Round {ri + 1}/{ROUNDS.length}</span>
        {players.length > 1 && <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>🎮 {players[currentPlayer]}'s turn</span>}
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.entries(score).map(([n, p]) => (
            <span key={n} style={{ fontSize: '0.78rem', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '20px' }}>{n}: {p}</span>
          ))}
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Which country does this flag belong to?
        </div>
        <div style={{
          fontSize: 'clamp(6rem, 20vw, 10rem)',
          lineHeight: 1, marginBottom: '32px',
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
          transition: 'transform 0.2s',
        }}>
          {r.emoji}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {r.options.map((opt, i) => {
            let bg = 'var(--bg-input)', border = 'var(--border-default)', color = 'var(--text-primary)';
            if (phase === 'reveal') {
              if (opt === r.name) { bg = 'rgba(16,185,129,0.15)'; border = 'var(--brand-emerald)'; color = 'var(--brand-emerald)'; }
              else if (opt === selected) { bg = 'rgba(239,68,68,0.12)'; border = '#ef4444'; color = '#ef4444'; }
            }
            return (
              <button
                key={i} onClick={() => handleChoice(opt)} disabled={phase === 'reveal'}
                style={{
                  padding: '16px', borderRadius: 'var(--border-radius-md)',
                  background: bg, border: `2px solid ${border}`, color,
                  cursor: phase === 'reveal' ? 'default' : 'pointer',
                  fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
                }}
                onMouseOver={e => { if (phase === 'guess') e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                onMouseOut={e => { if (phase === 'guess') e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME 4 — PACK THE BAG
// ─────────────────────────────────────────────────────────────────────────────

function PackTheBag({ onBack, players }) {
  const destinations = Object.keys(PACKING_ITEMS);
  const [dest, setDest]         = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [submitted, setSub]     = useState(false);
  const [score, setScore]       = useState(0);
  const [currentPlayer, setCurrent] = useState(0);
  const [playerScores, setPS]   = useState(() => Object.fromEntries(players.map(p => [p, 0])));
  const [round, setRound]       = useState(1);
  const [done, setDone]         = useState(false);

  const ROUNDS_TOTAL = Math.min(players.length * 2, 4);

  const destEmoji = { beach: '🏖️', mountain: '⛰️', city: '🏙️', safari: '🦁' };
  const destLabel = { beach: 'Beach Holiday', mountain: 'Mountain Trek', city: 'City Break', safari: 'Safari Adventure' };

  const startRound = (d) => {
    setDest(d);
    setSelected(new Set());
    setSub(false);
    setScore(0);
  };

  const toggleItem = (item) => {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const handleSubmit = () => {
    const { items, decoys } = PACKING_ITEMS[dest];
    let pts = 0;
    selected.forEach(i => {
      if (items.includes(i)) pts += 5;
      else pts -= 3; // penalty for packing a decoy
    });
    items.forEach(i => { if (!selected.has(i)) pts -= 2; }); // penalty for missing essentials
    pts = Math.max(0, pts);
    setScore(pts);
    setPS(s => ({ ...s, [players[currentPlayer]]: (s[players[currentPlayer]] || 0) + pts }));
    setSub(true);
  };

  const nextRound = () => {
    if (round >= ROUNDS_TOTAL) { setDone(true); return; }
    setRound(r => r + 1);
    setDest(null);
    setSub(false);
    setSelected(new Set());
    if (players.length > 1) setCurrent(c => (c + 1) % players.length);
  };

  if (done) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧳</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Bags Packed!</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {Object.entries(playerScores).sort((a, b) => b[1] - a[1]).map(([name, pts], i) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between', padding: '16px 20px',
                borderRadius: 'var(--border-radius-md)',
                background: i === 0 ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                border: `1px solid ${i === 0 ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              }}>
                <span style={{ fontWeight: 700 }}>{['🥇', '🥈', '🥉'][i] || ''} {name}</span>
                <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{pts} pts</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Play Again</button>
            <button className="btn btn-outline" onClick={onBack}>🎮 Games Hub</button>
          </div>
        </div>
      </div>
    );
  }

  // Destination picker
  if (!dest) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            Round {round}/{ROUNDS_TOTAL} — Where are you heading?
          </h2>
          {players.length > 1 && (
            <p style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>🎮 {players[currentPlayer]}'s turn to pack!</p>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {destinations.map(d => (
            <button
              key={d} onClick={() => startRound(d)}
              className="glass-panel"
              style={{ textAlign: 'center', padding: '32px 20px', cursor: 'pointer', transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>{destEmoji[d]}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{destLabel[d]}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const { items, decoys } = PACKING_ITEMS[dest];
  const allItems = shuffle([...items, ...decoys]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{destEmoji[dest]}</div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Pack for your {destLabel[dest]}!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Select the right items to pack. +5 for essentials, −3 for wrong items.
        </p>
        {players.length > 1 && <p style={{ color: 'var(--brand-primary)', fontWeight: 700, marginTop: '4px' }}>🎮 {players[currentPlayer]}'s turn</p>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
        {allItems.map(item => {
          let bg = 'var(--bg-input)', border = 'var(--border-default)', color = 'var(--text-primary)';
          if (selected.has(item)) { bg = 'rgba(99,102,241,0.2)'; border = 'var(--brand-primary)'; color = 'var(--brand-primary)'; }
          if (submitted) {
            if (items.includes(item) && selected.has(item)) { bg = 'rgba(16,185,129,0.2)'; border = 'var(--brand-emerald)'; color = 'var(--brand-emerald)'; }
            else if (!items.includes(item) && selected.has(item)) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#ef4444'; }
            else if (items.includes(item) && !selected.has(item)) { bg = 'rgba(245,158,11,0.15)'; border = 'var(--brand-amber)'; color = 'var(--brand-amber)'; }
          }
          return (
            <button
              key={item} onClick={() => toggleItem(item)} disabled={submitted}
              style={{
                padding: '10px 18px', borderRadius: '24px',
                background: bg, border: `2px solid ${border}`, color,
                cursor: submitted ? 'default' : 'pointer',
                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
              }}
            >
              {submitted ? (items.includes(item) ? (selected.has(item) ? '✅ ' : '⚠️ ') : (selected.has(item) ? '❌ ' : '')) : ''}
              {item}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={selected.size === 0} style={{ minWidth: '180px' }}>
            🧳 Check My Bag ({selected.size} items)
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            {score >= 20 ? '🏆' : score >= 10 ? '👍' : '😅'}
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>You scored {score} points!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.88rem' }}>
            {items.length} essential items · {decoys.length} decoys to avoid
          </p>
          <button className="btn btn-primary" onClick={nextRound}>
            {round >= ROUNDS_TOTAL ? '🏁 See Final Scores' : '➡️ Next Round'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER SETUP
// ─────────────────────────────────────────────────────────────────────────────

function PlayerSetup({ onStart, gameLabel }) {
  const [mode, setMode]       = useState(null); // 'solo' | 'multi'
  const [players, setPlayers] = useState(['Player 1', 'Player 2']);
  const [names, setNames]     = useState(['Player 1', 'Player 2']);

  if (!mode) return (
    <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎮</div>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{gameLabel}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>How many players?</p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => onStart(['You'])} style={{ minWidth: '140px', padding: '20px' }}>
          🧑 Solo
        </button>
        <button className="btn btn-outline" onClick={() => setMode('multi')} style={{ minWidth: '140px', padding: '20px' }}>
          👥 Multiplayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in card" style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Enter Player Names</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {names.map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              className="input-field"
              value={n}
              onChange={e => setNames(ns => ns.map((x, j) => j === i ? e.target.value : x))}
              placeholder={`Player ${i + 1}`}
              style={{ flex: 1 }}
            />
            {names.length > 2 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setNames(ns => ns.filter((_, j) => j !== i))}>✕</button>
            )}
          </div>
        ))}
        {names.length < 6 && (
          <button className="btn btn-outline btn-sm" onClick={() => setNames(ns => [...ns, `Player ${ns.length + 1}`])}>
            + Add Player
          </button>
        )}
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={() => onStart(names.filter(n => n.trim()).map(n => n.trim()))}
        disabled={names.filter(n => n.trim()).length < 2}
      >
        Start Game 🚀
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HUB
// ─────────────────────────────────────────────────────────────────────────────

const GAMES = [
  {
    id: 'trivia',
    icon: '🌍',
    label: 'Travel Trivia',
    desc: 'Test your geography & culture knowledge. Race against the clock!',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    players: '1–6 players',
    duration: '~5 min',
    difficulty: 'Medium',
  },
  {
    id: 'scramble',
    icon: '🔤',
    label: 'Word Scramble',
    desc: 'Unscramble travel words before your friends do!',
    gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    players: '1–6 players',
    duration: '~4 min',
    difficulty: 'Easy',
  },
  {
    id: 'flags',
    icon: '🚩',
    label: 'Flag Guesser',
    desc: 'Identify country flags from around the globe. How well do you know the world?',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
    players: '1–6 players',
    duration: '~4 min',
    difficulty: 'Medium',
  },
  {
    id: 'packing',
    icon: '🧳',
    label: 'Pack the Bag',
    desc: 'Choose the right items for your destination. Don\'t bring skis to the beach!',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    players: '1–6 players',
    duration: '~5 min',
    difficulty: 'Easy',
  },
];

export default function GamesScreen() {
  const navigate                = useNavigate();
  const [activeGame, setGame]   = useState(null); // game id
  const [players, setPlayers]   = useState(null);
  const [setup, setSetup]       = useState(false);

  const launchGame = (id) => { setGame(id); setPlayers(null); setSetup(true); };
  const handlePlayers = (ps) => { setPlayers(ps); setSetup(false); };
  const goHome = () => { setGame(null); setPlayers(null); setSetup(false); };

  const gameLabel = GAMES.find(g => g.id === activeGame)?.label || '';

  // Setup screen
  if (setup) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '6vh' }}>
        <button className="btn btn-ghost btn-sm" onClick={goHome} style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back to Games
        </button>
        <PlayerSetup onStart={handlePlayers} gameLabel={gameLabel} />
      </div>
    );
  }

  // Active game
  if (activeGame && players) {
    return (
      <div className="container animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn btn-ghost btn-sm" onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Games
          </button>
          <h1 style={{ fontSize: '1.3rem', margin: 0 }}>
            {GAMES.find(g => g.id === activeGame)?.icon} {gameLabel}
          </h1>
          {players.length > 1 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '20px' }}>
              👥 {players.join(' · ')}
            </span>
          )}
        </div>

        {activeGame === 'trivia'  && <TravelTrivia onBack={goHome} players={players} />}
        {activeGame === 'scramble' && <WordScramble onBack={goHome}  players={players} />}
        {activeGame === 'flags'   && <FlagGuesser  onBack={goHome}  players={players} />}
        {activeGame === 'packing' && <PackTheBag   onBack={goHome}  players={players} />}
      </div>
    );
  }

  // Hub
  return (
    <div className="container animate-fade-in">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '2vh' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎮</div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, marginBottom: '12px' }}>
          Travel Games Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
          Play solo or challenge your travel crew. Pick a game and see who knows the world best!
        </p>
      </div>

      {/* Game cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
        {GAMES.map(g => (
          <div
            key={g.id}
            className="glass-panel animate-fade-up"
            onClick={() => launchGame(g.id)}
            style={{
              padding: 0, overflow: 'hidden', cursor: 'pointer',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(99,102,241,0.25)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Gradient banner */}
            <div style={{ background: g.gradient, padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '8px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>{g.icon}</div>
              <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{g.label}</h2>
            </div>

            {/* Info */}
            <div style={{ padding: '20px 24px 24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>{g.desc}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '20px', color: 'var(--text-muted)' }}>
                  👥 {g.players}
                </span>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '20px', color: 'var(--text-muted)' }}>
                  ⏱ {g.duration}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 600,
                  background: g.difficulty === 'Easy' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: g.difficulty === 'Easy' ? 'var(--brand-emerald)' : 'var(--brand-amber)',
                }}>
                  {g.difficulty}
                </span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', background: g.gradient, border: 'none' }}
                onClick={e => { e.stopPropagation(); launchGame(g.id); }}
              >
                Play Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fun tagline */}
      <div style={{ textAlign: 'center', marginTop: '56px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        🌍 All games work offline · Pass the device for multiplayer fun
      </div>
    </div>
  );
}
