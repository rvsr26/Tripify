import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Shield, Star } from 'lucide-react';

const tierConfig = {
  Bronze: { color: '#cd7f32', icon: Shield, glow: 'rgba(205, 127, 50, 0.3)', label: 'Bronze Explorer' },
  Silver: { color: '#c0c0c0', icon: Star, glow: 'rgba(192, 192, 192, 0.3)', label: 'Silver Pathfinder' },
  Gold:   { color: '#fbbf24', icon: Zap, glow: 'rgba(251, 191, 36, 0.4)', label: 'Gold Voyager' },
  Elite:  { color: '#a855f7', icon: Crown, glow: 'rgba(168, 85, 247, 0.5)', label: 'Antigravity Elite' }
};

export default function EliteMemberCard({ user }) {
  const membership = user?.membership || { tier: 'Bronze', experiencePoints: 0 };
  const config = tierConfig[membership.tier] || tierConfig.Bronze;
  const TierIcon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="elite-card-container"
      whileHover={{ scale: 1.02 }}
    >
      <div className={`elite-card elite-card-${membership.tier.toLowerCase()}`}>
        <div className="card-glare" />
        
        <div className="card-header">
          <div className="tier-tag" style={{ border: `1px solid ${config.color}`, color: config.color }}>
            <TierIcon size={14} /> {config.label}
          </div>
          <div className="chip-logo">Tripify</div>
        </div>

        <div className="card-body">
          <div className="card-holder">
             <span className="label">GLOBAL IDENTITY</span>
             <h3 className="name">{user?.name?.toUpperCase()}</h3>
          </div>
          <div className="card-stats">
             <div className="stat">
                <span className="label">XP</span>
                <span className="value">{membership.experiencePoints}</span>
             </div>
             <div className="stat">
                <span className="label">SINCE</span>
                <span className="value">{new Date(user?.createdAt).getFullYear() || '2024'}</span>
             </div>
          </div>
        </div>

        <div className="card-footer">
          <div className="digital-key-id">
            TOKEN_ID: {user?._id?.slice(-8).toUpperCase()}
          </div>
          <div className="pulse-oracle">
             <div className="pulse-dot" style={{ background: config.color, boxShadow: `0 0 10px ${config.color}` }} />
             Oracle Link Active
          </div>
        </div>
      </div>
    </motion.div>
  );
}
