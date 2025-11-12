import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { plannerService } from '../api';

export default function MapExplorerScreen() {
  const [allTrips, setAllTrips] = useState([]);
  const [mappedTrips, setMappedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [backfilling, setBackfilling] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => { loadTrips(); }, []);

  const loadTrips = async () => {
    try {
      const data = await plannerService.getMyTrips();
      const trips = data.trips || [];
      setAllTrips(trips);
      setMappedTrips(trips.filter(t => t.location && t.location.lat && t.location.lng));
    } catch (err) {
      console.error('Failed to load trips for map:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      const result = await plannerService.backfillCoords();
      if (result.fixed > 0) {
        // Reload to show newly geocoded trips on map
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
          markersRef.current = {};
        }
        setLoading(true);
        await loadTrips();
      } else {
        alert('Could not find coordinates for any trips. Try adding more specific city names.');
      }
    } catch (err) {
      console.error('Backfill failed:', err);
      alert('Failed to fix coordinates. Please try again.');
    } finally {
      setBackfilling(false);
    }
  };

  useEffect(() => {
    if (!loading && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      L.tileLayer(
        isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }
      ).addTo(mapInstance.current);

      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const markerGroup = L.featureGroup();
      mappedTrips.forEach(trip => {
        const marker = L.marker([trip.location.lat, trip.location.lng], { icon: defaultIcon })
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; padding: 6px;">
              <h4 style="margin: 0 0 6px; font-weight: 700; font-size: 0.95rem;">${trip.title}</h4>
              <p style="margin: 0 0 10px; color: #888; font-size: 0.82rem;">${trip.city} · ${trip.days} Days</p>
              <button id="btn-${trip._id}" style="
                background: linear-gradient(135deg, #6366f1, #a855f7);
                color: white;
                border: none;
                padding: 7px 16px;
                border-radius: 10px;
                cursor: pointer;
                width: 100%;
                font-weight: 600;
                font-size: 0.82rem;
                font-family: inherit;
              ">Open Trip</button>
            </div>
          `);

        marker.on('popupopen', () => {
          document.getElementById(`btn-${trip._id}`).onclick = () => navigate(`/trips/${trip._id}`);
        });

        marker.addTo(markerGroup);
        markersRef.current[trip._id] = marker;
      });

      markerGroup.addTo(mapInstance.current);

      if (mappedTrips.length > 0) {
        mapInstance.current.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersRef.current = {};
      }
    };
  }, [loading, mappedTrips, navigate]);

  const flyToTrip = (trip) => {
    setSelectedTripId(trip._id);
    if (trip.location?.lat && trip.location?.lng && mapInstance.current) {
      mapInstance.current.flyTo([trip.location.lat, trip.location.lng], 12, { duration: 1.2 });
      const marker = markersRef.current[trip._id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 600);
      }
    }
  };

  const hasLocation = (trip) => !!(trip.location?.lat && trip.location?.lng);

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 72px)', display: 'flex', gap: '0', overflow: 'hidden' }}>
      {/* ── Trip Sidebar ──────────────────── */}
      <div className="map-trip-sidebar">
        <div style={{ padding: '20px 16px 12px' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>My Trips</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: allTrips.length > mappedTrips.length && !loading ? '10px' : '0' }}>
            {allTrips.length} trip{allTrips.length !== 1 ? 's' : ''} · {mappedTrips.length} on map
          </p>
          {!loading && allTrips.length > 0 && allTrips.length > mappedTrips.length && (
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '0.78rem' }}
              onClick={handleBackfill}
              disabled={backfilling}
            >
              {backfilling ? (
                <><span className="loading-spinner-sm" /> Fixing...</>
              ) : (
                `📍 Fix Map Pins (${allTrips.length - mappedTrips.length} missing)`
              )}
            </button>
          )}
        </div>

        <div className="map-trip-list">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="loading-spinner" />
            </div>
          ) : allTrips.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✈️</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                No trips yet. Create your first trip!
              </p>
              <Link to="/" className="btn btn-primary btn-sm">Plan a Trip</Link>
            </div>
          ) : (
            allTrips.map((trip, i) => (
              <div
                key={trip._id}
                className={`map-trip-item ${selectedTripId === trip._id ? 'active' : ''} ${!hasLocation(trip) ? 'no-location' : ''}`}
                onClick={() => hasLocation(trip) ? flyToTrip(trip) : navigate(`/trips/${trip._id}`)}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="map-trip-item-header">
                  <div className="map-trip-item-icon">
                    {hasLocation(trip) ? '📍' : '📋'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="map-trip-item-title">{trip.title}</div>
                    <div className="map-trip-item-meta">
                      {trip.city} · {trip.days} days
                    </div>
                  </div>
                </div>

                <div className="map-trip-item-footer">
                  <div className="map-trip-item-details">
                    <span>💰 {trip.currency || '$'}{trip.budget?.toLocaleString() || '—'}</span>
                    <span>👥 {trip.members?.length || 1}</span>
                  </div>
                  {hasLocation(trip) ? (
                    <span className="map-trip-item-badge on-map">On Map</span>
                  ) : (
                    <span className="map-trip-item-badge no-map">No coords</span>
                  )}
                </div>

                <Link
                  to={`/trips/${trip._id}`}
                  className="map-trip-item-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details →
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Map Area ──────────────────────── */}
      <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
        {/* Map Header Overlay */}
        <div className="map-header-overlay">
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>🗺️ Global Trip Explorer</h1>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {mappedTrips.length} trip{mappedTrips.length !== 1 ? 's' : ''} pinned
          </span>
        </div>

        {loading ? (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
            <div className="loading-spinner" />
          </div>
        ) : mappedTrips.length === 0 && allTrips.length > 0 ? (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📍</div>
            <h3>No trips with map data</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Your trips don't have location coordinates yet.<br />
              Select a trip from the sidebar to view its details.
            </p>
          </div>
        ) : null}
        <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 1 }} />
      </div>
    </div>
  );
}
