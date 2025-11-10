export function initSocket(io) {
  io.on('connection', socket => {
    console.log('socket connected', socket.id);
    
    socket.on('join', room => { 
      socket.join(room); 
      console.log(`Socket ${socket.id} joined room ${room}`);
    });
    
    // Real-Time Chat handling
    socket.on('sendMessage', (data) => {
      const { room } = data;
      io.to(room).emit('receiveMessage', data);
    });

    // Real-Time Itinerary Collaboration
    socket.on('updateItinerary', (data) => {
      // data format: { room, itinerary, senderId }
      const { room, itinerary, senderId } = data;
      // Broadcast the updated itinerary to everyone else in the room
      socket.to(room).emit('itineraryUpdated', { itinerary, senderId });
    });

    // Real-Time Trip Collaboration
    socket.on('updateTrip', (data) => {
      // data format: { room, trip, senderId }
      const { room, trip, senderId } = data;
      // Broadcast the updated trip to everyone else in the room
      socket.to(room).emit('tripUpdated', { trip, senderId });
    });

    // ── Collaborative Atlas: War Room Events ──────────────────────────────
    
    // Sync markers, notes, and doodles on the shared canvas
    socket.on('canvas-update', (data) => {
      const { room } = data;
      // Broadcast to everyone else in the trip session
      socket.to(room).emit('canvas-sync', data);
    });

    // Share cursor positions for "Multiplayer" feel
    socket.on('cursor-move', (data) => {
      const { room } = data;
      socket.to(room).emit('cursor-sync', data);
    });

    socket.on('ping', (d) => socket.emit('pong', d));
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
  });
  console.log('Socket.io Chat initialized');
}
