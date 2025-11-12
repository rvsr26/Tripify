import React, { useState } from 'react';
import Footer from '../components/Footer';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-item glass-panel ${isOpen ? 'open' : ''}`} style={{ marginBottom: '16px', cursor: 'pointer', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={() => setIsOpen(!isOpen)}>
      <div className="faq-question" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.05rem', color: isOpen ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
        <span>{question}</span>
        <span style={{ fontSize: '1.4rem', fontWeight: 300, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && <div className="faq-answer" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}>{answer}</div>}
    </div>
  );
};

export default function FAQScreen() {
  const faqs = [
    {
      question: "What is Tripify?",
      answer: "Tripify is a next-generation AI travel social platform that helps you plan, budget, and share your journeys seamlessly using Google Gemini 1.5 Pro."
    },
    {
      question: "How does the AI Planner work?",
      answer: "Our AI Planner takes your preferences—destination, dates, budget, and interests—and generates a hyper-personalized itinerary in seconds, including real-time weather and opening hours."
    },
    {
      question: "Is Tripify free to use?",
      answer: "Yes! Tripify offers a robust free tier. We also have 'Pro' features that offer deeper AI insights, exclusive deals, and offline support."
    },
    {
      question: "Can I use Tripify for group trips?",
      answer: "Absolutely. Tripify is built for social travel. You can invite friends, split budgets, and vote on activities in real-time."
    },
    {
      question: "How do I save my itineraries?",
      answer: "All your plans are automatically saved to your 'My Trips' section and are synced across all your devices."
    },
    {
      question: "Can I export my trip to Google Maps?",
      answer: "Yes, you can export any itinerary to Google Maps or download it as a PDF for offline use."
    }
  ];

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header className="section-header" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h1 style={{ fontSize: '2.5rem' }}>Frequently Asked Questions</h1>
          <p>Everything you need to know about Tripify and our AI-powered travel tools.</p>
        </header>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: '60px' }}><Footer /></div>
    </div>
  );
}
