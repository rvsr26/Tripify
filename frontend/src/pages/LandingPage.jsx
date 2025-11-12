import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Sparkles, 
  Globe, 
  Plane, 
  Star, 
  MapPin, 
  Utensils, 
  Film, 
  ArrowRight,
  TrendingUp,
  Users,
  Wallet,
  Gamepad2,
  ChevronDown,
  Heart,
  Apple,
  Play,
  Sun,
  Moon,
  Quote
} from 'lucide-react';
import Footer from '../components/Footer';
import { ScrollReveal, StaggerContainer } from '../components/ScrollReveal';
import Magnetic from '../components/Magnetic';

const destinations = [
  { id: 1, name: 'Santorini, Greece', meta: 'Volcanic Sunsets', rating: 4.9, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Kyoto, Japan', meta: 'Traditional Zen', rating: 4.8, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'Amalfi Coast, Italy', meta: 'Cliffs & Limoncello', rating: 5.0, image: 'https://images.unsplash.com/photo-1533903345306-15d1c30952de?auto=format&fit=crop&w=800&q=80' },
  { id: 4, name: 'Sedona, USA', meta: 'Red Rock Magic', rating: 4.7, image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80' },
  { id: 5, name: 'Swiss Alps', meta: 'Peak Majesty', rating: 4.9, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 6, name: 'Bali, Indonesia', meta: 'Tropical Soul', rating: 4.8, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
  { id: 7, name: 'Reykjavik, Iceland', meta: 'Northern Lights', rating: 4.9, image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=80' },
  { id: 8, name: 'Marrakech, Morocco', meta: 'Desert Mystique', rating: 4.6, image: 'https://images.unsplash.com/photo-1539020140153-e479b7c2b3af?auto=format&fit=crop&w=800&q=80' },
  { id: 9, name: 'Bora Bora', meta: 'Azure Lagoons', rating: 5.0, image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80' },
  { id: 10, name: 'Petra, Jordan', meta: 'Ancient Secrets', rating: 4.9, image: 'https://images.unsplash.com/photo-1579606030925-59acc6f91674?auto=format&fit=crop&w=800&q=80' }
];

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Solo Traveler",
    text: "Tripify completely changed how I plan my solo trips. The AI suggestions were spot on!",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Mark Thompson",
    role: "Family Explorer",
    text: "Planning for a family of five is usually a nightmare. Tripify made it seamless and even fun.",
    avatar: "https://i.pravatar.cc/150?u=mark"
  },
  {
    name: "Elena Rodriguez",
    role: "Budget Backpacker",
    text: "The budget tracking tool is a lifesaver. I stayed under my limit for a whole month in SE Asia!",
    avatar: "https://i.pravatar.cc/150?u=elena"
  },
  {
    name: "James Wilson",
    role: "Digital Nomad",
    text: "Tripify's buddy finder helped me find a great group for a trek in Northern Thailand. Best trip ever!",
    avatar: "https://i.pravatar.cc/150?u=james"
  },
  {
    name: "Sofia Chen",
    role: "Cultural Enthusiast",
    text: "I love how it finds hidden gems. I've seen parts of Tokyo that aren't even in the guidebooks.",
    avatar: "https://i.pravatar.cc/150?u=sofia"
  }
];

export default function LandingPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200"
  ];

  const destScrollRef = useRef(null);
  const featScrollRef = useRef(null);
  const testScrollRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Infinite Marquee Motion Settings (LTR)
  const marqueeVariants = {
    animate: {
      x: ["-50%", "0%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 35, // Premium smooth cruise
          ease: "linear",
        },
      },
    },
  };

  return (
    <div className="landing-container advanced-theme">
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />

      <div className="ultra-mesh-bg" />

      {/* ── Navigation ── */}
      <nav className="landing-nav luxury-glass">
        <div className="landing-logo luxury-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 900 }}>Tripify</div>
        <div className="landing-nav-links">
           <a href="#gallery" className="nav-link">Destinations</a>
           <a href="#features" className="nav-link">Features</a>
           <a href="#testimonials" className="nav-link">Reviews</a>
           <div className="nav-divider" />
           <button 
             className="btn btn-ghost btn-icon theme-toggle-landing" 
             onClick={toggleTheme}
             style={{ marginRight: '10px', color: 'var(--text-secondary)' }}
           >
             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
           </button>
           <Link to="/auth" className="btn btn-ghost btn-sm">Login</Link>
           <Magnetic>
             <Link to="/auth" className="btn btn-primary btn-sm btn-pill" style={{ padding: '10px 24px', background: 'var(--brand-gold)', color: 'white' }}>Join Now</Link>
           </Magnetic>
        </div>
      </nav>

      {/* ── Hero Section (Split) ── */}
      <section className="container landing-hero split">
        <div className="hero-left">
          <ScrollReveal direction="down">
            <div className="hero-content-stack">
              <div className="hero-main-badge">✨ Next-Gen Travel Planning</div>
              <h1 className="landing-title">
                Crafting Your <br/>
                <span className="vibrant-gradient-text">Unforgettable</span> <br/>
                Escape.
              </h1>
              <p className="landing-subtitle">
                Discover curated journeys, personalized AI itineraries, and a community of explorers. All in one place.
              </p>
              <div className="hero-actions" style={{ display: 'flex', gap: '16px' }}>
                <Magnetic>
                  <button className="btn btn-primary btn-lg btn-pill" style={{ background: 'var(--brand-gold)', color: 'white', padding: '16px 40px' }} onClick={() => navigate('/auth')}>
                    Start Journey
                  </button>
                </Magnetic>
                <button className="btn btn-outline btn-lg btn-pill" style={{ padding: '16px 40px' }}>
                  Explore More
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="hero-right">
          <ScrollReveal delay={0.3} direction="up">
            <div className="destination-image-container">
              {heroImages.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`Destination ${idx + 1}`} 
                  className={idx === currentSlide ? 'active' : ''} 
                />
              ))}
            </div>
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="luxury-glass theme-aware-badge"
              style={{ 
                position: 'absolute', 
                bottom: '10%', 
                left: '-40px', 
                padding: '16px 28px', 
                borderRadius: '20px', 
                display: 'flex', 
                gap: '14px', 
                alignItems: 'center', 
                zIndex: 10, 
                border: '1px solid var(--brand-gold)',
                background: 'var(--bg-card)', 
                backdropFilter: 'blur(30px)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ background: 'rgba(255, 165, 0, 0.2)', color: '#fbbf24', padding: '10px', borderRadius: '12px' }}><Star size={24} fill="#fbbf24" /></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.05em' }}>TOP RATED</div>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '1.2rem' }}>4.9/5 Quality</div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Destination Gallery (Prioritized) ── */}
      <section id="gallery" className="container" style={{ padding: '100px 0' }}>
        <div className="section-header">
          <ScrollReveal>
            <h2 style={{ fontSize: '3rem', fontWeight: 900 }}>Popular <span className="vibrant-gradient-text">Destinations</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Handpicked escapes for the sophisticated traveler.</p>
          </ScrollReveal>
        </div>

        <div className="gallery-scroll-container">
          <motion.div className="marquee-track" variants={marqueeVariants} animate="animate">
            {[...destinations, ...destinations].map((dest, idx) => (
              <div key={`${dest.id}-${idx}`} className="destination-card-premium" onClick={() => navigate('/auth')}>
                <img src={dest.image} alt={dest.name} />
                <div className="card-overlay">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 className="card-title">{dest.name}</h3>
                      <div className="card-meta"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />{dest.meta}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '99px', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} fill="white" /> {dest.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Showcase ── */}
      <section id="features" className="container" style={{ paddingBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
           <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Everything You <span className="vibrant-gradient-text">Need.</span></h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>All-in-one platform for the modern traveler.</p>
        </div>
        
        <div className="gallery-scroll-container">
          <motion.div className="marquee-track" variants={marqueeVariants} animate="animate">
            {[
              { title: 'AI Itineraries', desc: 'Genie-powered plans tailored to your soul.', icon: Sparkles },
              { title: 'Smart Budget', desc: 'Financial clarity across borders.', icon: Wallet },
              { title: 'Global Community', desc: 'Connect with a tribe of explorers.', icon: Users },
              { title: 'Real-time Maps', desc: 'Live navigation and hot-spot alerts.', icon: MapPin },
              { title: 'Buddy Match', desc: 'Find your perfect travel partner.', icon: Heart },
              { title: 'Deal Alerts', desc: 'Exclusive savings on luxury stays.', icon: TrendingUp },
              { title: 'Gamified Journey', desc: 'Earn badges as you cross borders.', icon: Gamepad2 }
            ].concat([
              { title: 'AI Itineraries', desc: 'Genie-powered plans tailored to your soul.', icon: Sparkles },
              { title: 'Smart Budget', desc: 'Financial clarity across borders.', icon: Wallet },
              { title: 'Global Community', desc: 'Connect with a tribe of explorers.', icon: Users },
              { title: 'Real-time Maps', desc: 'Live navigation and hot-spot alerts.', icon: MapPin },
              { title: 'Buddy Match', desc: 'Find your perfect travel partner.', icon: Heart },
              { title: 'Deal Alerts', desc: 'Exclusive savings on luxury stays.', icon: TrendingUp },
              { title: 'Gamified Journey', desc: 'Earn badges as you cross borders.', icon: Gamepad2 }
            ]).map((feature, idx) => (
              <div key={idx} className="testimonial-card" style={{ minWidth: '300px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--brand-primary-light)', width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <feature.icon size={30} />
                </div>
                <h4 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 800 }}>{feature.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Reviews Showcase ── */}
      <section id="testimonials" className="ambient-dark-section" style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>What Our <span className="vibrant-gradient-text">Explorers</span> Say</h2>
          </div>
          
          <div className="gallery-scroll-container">
            <motion.div className="marquee-track" variants={marqueeVariants} animate="animate">
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div key={`${t.name}-${idx}`} className="testimonial-card" style={{ minWidth: '340px' }}>
                  <Quote className="quote-icon" size={32} style={{ marginBottom: '16px' }} />
                  <p className="testimonial-text" style={{ fontSize: '1rem', marginBottom: '24px' }}>"{t.text}"</p>
                  <div className="user-info">
                    <img src={t.avatar} alt={t.name} className="user-avatar" />
                    <div>
                      <div className="user-name" style={{ fontSize: '0.95rem' }}>{t.name}</div>
                      <div className="user-role" style={{ fontSize: '0.8rem' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>


      {/* ── Final Call to Action ── */}
      <section id="cta-finale" className="container" style={{ padding: '20px 0' }}>
         <div className="cta-cinematic-backdrop">
            <div className="ambient-orb orb-1" />
            <div className="ambient-orb orb-2" />
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <ScrollReveal direction="up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="trust-row">
                  <div className="avatar-stack">
                    <img src="https://i.pravatar.cc/100?u=1" alt="u1" />
                    <img src="https://i.pravatar.cc/100?u=2" alt="u2" />
                    <img src="https://i.pravatar.cc/100?u=3" alt="u3" />
                    <img src="https://i.pravatar.cc/100?u=4" alt="u4" />
                    <img src="https://i.pravatar.cc/100?u=5" alt="u5" />
                  </div>
                  <div className="trust-badge">
                    <Star size={14} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                    4.9/5 Rating (10k+ Users)
                  </div>
                </div>

                <h2 className="cta-title">
                  Start Your <span className="vibrant-gradient-text">Odyssey.</span>
                </h2>
                <p className="cta-desc">
                  The world is waiting for your story. Join a global community of modern explorers crafting 
                  unforgettable memories, finding hidden gems, and traveling smarter with AI-powered insight.
                </p>
                
                <div className="cta-main-action">
                  <Magnetic>
                    <button className="btn btn-premium-gold btn-lg btn-pill" onClick={() => navigate('/auth')}>
                      Join Tripify Today
                    </button>
                  </Magnetic>
                </div>

                <div className="app-download-row">
                  <button className="download-btn">
                    <Apple size={24} />
                    <div>
                      <span className="bt-text-small">Download on the</span>
                      <span className="bt-text-large">App Store</span>
                    </div>
                  </button>
                  <button className="download-btn">
                    <Play size={24} />
                    <div>
                      <span className="bt-text-small">Get it on</span>
                      <span className="bt-text-large">Google Play</span>
                    </div>
                  </button>
                </div>
              </ScrollReveal>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
