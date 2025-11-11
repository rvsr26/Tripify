import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, MousePointer2, Type, Save, Users, AlertCircle } from 'lucide-react';
import { tripPlanService } from '../api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/_/backend');

export default function CollaborativeAtlas({ user }) {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [trip, setTrip] = useState(null);
  const [cursors, setCursors] = useState({}); // { socketId: { x, y, name, color } }
  const [canvas, setCanvas] = useState({ markers: [], notes: [] });
  const [mode, setMode] = useState('view'); // 'view', 'marker', 'note'
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Fetch trip data
    tripPlanService.getById(tripId).then(res => {
      setTrip(res.trip);
      if (res.trip.canvasState) setCanvas(res.trip.canvasState);
      setLoading(false);
    });

    // 2. Init Socket
    const s = io(SOCKET_URL);
    setSocket(s);

    s.emit('join', tripId);

    s.on('cursor-sync', (data) => {
      if (data.senderId !== s.id) {
        setCursors(prev => ({ ...prev, [data.senderId]: data }));
      }
    });

    s.on('canvas-sync', (data) => {
      if (data.senderId !== s.id) {
        setCanvas(data.canvas);
      }
    });

    return () => s.disconnect();
  }, [tripId]);

  const handleMouseMove = (e) => {
    if (!socket) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    socket.emit('cursor-move', {
      room: tripId,
      senderId: socket.id,
      name: user?.name,
      x, y,
      color: user?.membership?.tier === 'Elite' ? '#a855f7' : '#fbbf24'
    });
  };

  const handleCanvasClick = (e) => {
    if (mode === 'view') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newElement = {
      id: Math.random().toString(36).substr(2, 9),
      x, y,
      type: mode,
      text: mode === 'note' ? 'New Note' : '',
      senderId: user?._id
    };

    const updatedCanvas = {
      ...canvas,
      [mode === 'marker' ? 'markers' : 'notes']: [
        ...(canvas[mode === 'marker' ? 'markers' : 'notes'] || []),
        newElement
      ]
    };

    setCanvas(updatedCanvas);
    socket.emit('canvas-update', { room: tripId, canvas: updatedCanvas, senderId: socket.id });
  };

  const saveAtlas = async () => {
    try {
      await tripPlanService.update(tripId, { canvasState: canvas });
      alert('Atlas Synced to Cloud!');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="atlas-war-room">
      <header className="atlas-header">
        <div className="atlas-info">
           <h2 className="vibrant-gradient-text">Atlas: {trip?.title}</h2>
           <div className="active-users">
              <Users size={16} /> {Object.keys(cursors).length + 1} Active
           </div>
        </div>
        <div className="atlas-tools">
           <button 
             className={`tool-btn ${mode === 'marker' ? 'active' : ''}`}
             onClick={() => setMode(mode === 'marker' ? 'view' : 'marker')}
           >
             <MapPin size={18} /> <span>Drop Pin</span>
           </button>
           <button 
             className={`tool-btn ${mode === 'note' ? 'active' : ''}`}
             onClick={() => setMode(mode === 'note' ? 'view' : 'note')}
           >
             <Type size={18} /> <span>Sticky Note</span>
           </button>
           <div className="tool-divider" />
           <button className="btn btn-primary btn-sm btn-pill" onClick={saveAtlas}>
             <Save size={16} /> Save Canvas
           </button>
           <button className="btn btn-outline btn-sm btn-pill" onClick={() => navigate(`/trips/${tripId}`)}>
             Exit War Room
           </button>
        </div>
      </header>

      <div 
        className="atlas-canvas-container"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
      >
        <div className="canvas-grid-bg" />
        
        {/* Collaborative Elements */}
        {canvas.markers?.map(m => (
          <motion.div 
            key={m.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="canvas-marker"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            <MapPin size={24} color="var(--brand-gold)" fill="var(--brand-gold)" />
          </motion.div>
        ))}

        {canvas.notes?.map(n => (
          <motion.div 
            key={n.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="canvas-note"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="note-body">{n.text}</div>
          </motion.div>
        ))}

        {/* Remote Cursors */}
        <AnimatePresence>
          {Object.entries(cursors).map(([id, c]) => (
            <motion.div
              key={id}
              className="remote-cursor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, left: `${c.x}%`, top: `${c.y}%` }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              <MousePointer2 size={18} color={c.color} fill={c.color} />
              <span className="cursor-label" style={{ background: c.color }}>{c.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {mode !== 'view' && (
          <div className="atlas-mode-indicator">
            <AlertCircle size={16} /> Clicking will {mode === 'marker' ? 'drop a pin' : 'add a note'}
          </div>
        )}
      </div>
    </div>
  );
}
