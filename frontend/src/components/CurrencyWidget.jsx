import React, { useState, useEffect } from 'react';
import axios from 'axios';

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNH', 'SGD'];

export default function CurrencyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rates, setRates]   = useState(null);
  const [amount, setAmount] = useState(100);
  const [from, setFrom]     = useState('USD');
  const [to, setTo]         = useState('EUR');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !rates) {
      setLoading(true);
      // Free API, no key required
      axios.get('https://api.exchangerate-api.com/v4/latest/USD')
        .then(res => setRates(res.data.rates))
        .catch(err => console.error('Currency API failed:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, rates]);

  const converted = rates ? ((amount / rates[from]) * rates[to]).toFixed(2) : '...';

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="currency-widget-container">
      {/* Floating Button */}
      <button 
        className="currency-widget-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle currency converter"
      >
        💱
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="card currency-widget-popover animate-fade-in" style={{ padding: '20px', width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, padding: 0 }}>Currency Converter</h3>
            <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }} onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <div className="loading-spinner-sm" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Amount</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="input-field" value={from} onChange={e => setFrom(e.target.value)} style={{ width: '80px', padding: '8px' }}>
                    {POPULAR_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={amount} 
                    onChange={e => setAmount(Number(e.target.value))} 
                    style={{ flex: 1, padding: '8px' }}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0', zIndex: 1 }}>
                <button className="btn btn-ghost btn-sm" onClick={handleSwap} style={{ padding: '4px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                  ⇅
                </button>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Converted</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="input-field" value={to} onChange={e => setTo(e.target.value)} style={{ width: '80px', padding: '8px' }}>
                    {POPULAR_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="input-field" style={{ flex: 1, padding: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    {converted}
                  </div>
                </div>
              </div>
              
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                Live mid-market rates
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
