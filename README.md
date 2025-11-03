# 🌍 Tripify Enterprise

Welcome to **Tripify Enterprise**, a next-generation AI-powered travel ecosystem. This project combines a high-performance backend, a modern web frontend, and a feature-rich mobile application to provide a seamless travel experience.

## 🚀 Projects Included

This monorepo consists of:

-   📂 **[backend](./backend)**: Node.js + Express server with Google Gemini 2.0 AI, Firebase, and real-time updates via Socket.io.
-   📂 **[frontend](./frontend)**: A sleek web application built with React, Vite, and Framer Motion for a premium user experience.
-   📂 **[mobile](./mobile)**: A cross-platform mobile application built with React Native and Expo.

---

## ✨ Key Features

### 🧠 AI-Powered Planning
- Integrated with **Google Gemini 2.0** for intelligent trip suggestions and natural language chat.
- Context-aware itinerary generation.

### 🔐 Secure Authentication
- **Advanced Social Auth**: Secure Google Login with ID Token verification.
- **Firebase Integration**: Robust user management and cloud services.

### 🗺️ Real-time & Maps
- **Socket.io**: Collaborative real-time updates and live chat functionality.
- **Interactive Maps**: Powered by Leaflet (Web) and React Native Maps (Mobile) with automated geocoding.

### 💳 Commerce & Media
- **Stripe Integration**: Secure payment processing for bookings.
- **Cloudinary**: High-performance image and media storage.

---

## 🛠️ Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Socket.io, Google Gemini 2.0, Firebase Admin, Stripe, Cloudinary, Swagger |
| **Frontend** | React 19, Vite, Framer Motion, Leaflet, Lucide React, Google OAuth |
| **Mobile** | React Native, Expo, React Navigation, Socket.io Client, Lucide Native |

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or later)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Firebase Account
- Google Cloud Project (for Gemini & Auth)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rvsr26/Tripify.git
    cd Tripify
    ```

2.  **Setup Environment Variables:**
    Duplicate the `.env.example` (if available) or create a `.env` in the `backend` and `frontend` folders with your API keys.

3.  **Run Backend:**
    ```bash
    cd backend
    npm install
    npm run dev
    ```

4.  **Run Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  **Run Mobile:**
    ```bash
    cd mobile
    npm install
    npx expo start
    ```

---

## 📄 License

Internal use only. All rights reserved. ✨
