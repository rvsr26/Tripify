# Tripify Enterprise Backend (Production Ready)

This is the high-performance backend serving the Tripify Enterprise ecosystem.

Features:
- ✨ **Google Gemini 2.0 Integration**: Next-gen AI trip planning and context-aware chat.
- 🔐 **Advanced Social Auth**: Secure Google Login with ID Token verification.
- 🚀 **Express + MongoDB**: Robust, scalable REST API architecture.
- 💬 **Socket.io**: Real-time collaborative trip updates and chat.
- 🗺️ **Auto-Geocoding**: Integrated Nominatim geocoding for instant map visualization.
- 📦 **In-Memory Logic**: Optimized queues for bookings and notifications.

## Quickstart (Local)
1.  `npm install`
2.  Ensure local MongoDB is running (`mongodb://127.0.0.1:27017/tripify`).
3.  Configure `.env` with `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, and `Firebase` credentials.
4.  `npm run dev`

## Configuration
- Use the provided Gemini and Google OAuth keys for standard AI/Auth functionality.
- Configure MongoDB and JWT secrets for secure production usage.
