import React, { useState, useEffect } from 'react';
import { featuresService } from '../api';

export default function StoriesReel() {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    featuresService.getStories().then(res => setStories(res.stories || [])).catch(console.error);
  }, []);

  const openStory = (story) => {
    setActiveStory(story);
    setSlideIdx(0);
    featuresService.getStory(story._id).catch(() => {}); // increment view count
  };

  const nextSlide = () => {
    if (!activeStory) return;
    if (slideIdx < activeStory.slides.length - 1) setSlideIdx(prev => prev + 1);
    else setActiveStory(null);
  };

  const prevSlide = () => {
    if (slideIdx > 0) setSlideIdx(prev => prev - 1);
  };

  const handleLike = async () => {
    if (!activeStory) return;
    try {
      const res = await featuresService.likeStory(activeStory._id);
      setActiveStory({ ...activeStory, likes: new Array(res.likes).fill('x') });
    } catch (e) { console.error('Like failed', e); }
  };

  if (!stories.length) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Trip Stories</h3>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
        {stories.map(story => {
          const firstSlide = story.slides?.[0];
          return (
            <div 
              key={story._id} 
              onClick={() => openStory(story)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
            >
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', padding: '3px', background: 'var(--gradient-brand)' }}>
                {firstSlide?.imageUrl ? (
                  <img src={firstSlide.imageUrl} alt={story.title} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bg-document)' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: firstSlide?.bgColor || 'var(--brand-primary)', border: '2px solid var(--bg-document)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    📖
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', width: '74px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                {story.userId?.username || 'User'}
              </span>
            </div>
          );
        })}
      </div>

      {activeStory && activeStory.slides && activeStory.slides.length > 0 && (
        <div className="modal-overlay" style={{ background: '#000', zIndex: 3000 }} onClick={() => setActiveStory(null)}>
          <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 3010 }} onClick={() => setActiveStory(null)}>✕</button>
          
          <div style={{ width: '100%', maxWidth: '420px', height: '100%', maxHeight: '800px', position: 'relative', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            {/* Progress Bars */}
            <div style={{ position: 'absolute', top: '24px', left: '16px', right: '16px', display: 'flex', gap: '4px', zIndex: 3010 }}>
              {activeStory.slides.map((_, i) => (
                <div key={i} style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'white', width: i < slideIdx ? '100%' : i === slideIdx ? '100%' : '0%', transition: i === slideIdx ? 'width 5s linear' : 'none' }} />
                </div>
              ))}
            </div>

            {/* User Info */}
            <div style={{ position: 'absolute', top: '40px', left: '16px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 3010, color: 'white' }}>
              <div className="avatar-initials" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'var(--brand-primary)' }}>
                {activeStory.userId?.name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{activeStory.userId?.username}</span>
            </div>

            {/* Slide Content */}
            <div style={{ flex: 1, position: 'relative', background: activeStory.slides[slideIdx].bgColor || '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {activeStory.slides[slideIdx].imageUrl && (
                <img src={activeStory.slides[slideIdx].imageUrl} alt="story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {/* Overlay Gradient */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)' }} />
              
              <div style={{ position: 'absolute', bottom: '80px', left: '24px', right: '24px', color: 'white', textAlign: 'center', zIndex: 3010 }}>
                {activeStory.slides[slideIdx].location && <div style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-block', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '4px' }}>📍 {activeStory.slides[slideIdx].location}</div>}
                <p style={{ fontSize: '1.2rem', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.6)', margin: 0 }}>
                  {activeStory.slides[slideIdx].caption}
                </p>
              </div>
            </div>

            {/* Click Areas */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 3005 }}>
              <div style={{ flex: 1 }} onClick={prevSlide} />
              <div style={{ flex: 2 }} onClick={nextSlide} />
            </div>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 3010, display: 'flex', gap: '16px' }}>
              <button 
                onClick={handleLike}
                style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
              >
                <span style={{ fontSize: '1.2rem' }}>❤️</span>
                <span style={{ fontWeight: 600 }}>{activeStory.likes?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
