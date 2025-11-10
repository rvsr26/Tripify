import axios from 'axios';

/**
 * Well-known city coordinates fallback for when geocoding APIs are unavailable.
 */
const CITY_COORDS = {
  'tokyo':        { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' },
  'japan':        { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' },
  'paris':        { lat: 48.8566, lng: 2.3522,   address: 'Paris, France' },
  'london':       { lat: 51.5074, lng: -0.1278,  address: 'London, United Kingdom' },
  'new york':     { lat: 40.7128, lng: -74.0060,  address: 'New York, USA' },
  'nyc':          { lat: 40.7128, lng: -74.0060,  address: 'New York, USA' },
  'dubai':        { lat: 25.2048, lng: 55.2708,   address: 'Dubai, UAE' },
  'singapore':    { lat: 1.3521,  lng: 103.8198,  address: 'Singapore' },
  'rome':         { lat: 41.9028, lng: 12.4964,   address: 'Rome, Italy' },
  'barcelona':    { lat: 41.3874, lng: 2.1686,    address: 'Barcelona, Spain' },
  'amsterdam':    { lat: 52.3676, lng: 4.9041,    address: 'Amsterdam, Netherlands' },
  'bangkok':      { lat: 13.7563, lng: 100.5018,  address: 'Bangkok, Thailand' },
  'istanbul':     { lat: 41.0082, lng: 28.9784,   address: 'Istanbul, Turkey' },
  'sydney':       { lat: -33.8688, lng: 151.2093, address: 'Sydney, Australia' },
  'bali':         { lat: -8.3405, lng: 115.0920,  address: 'Bali, Indonesia' },
  'goa':          { lat: 15.2993, lng: 74.1240,   address: 'Goa, India' },
  'delhi':        { lat: 28.7041, lng: 77.1025,   address: 'Delhi, India' },
  'new delhi':    { lat: 28.7041, lng: 77.1025,   address: 'New Delhi, India' },
  'mumbai':       { lat: 19.0760, lng: 72.8777,   address: 'Mumbai, India' },
  'jaipur':       { lat: 26.9124, lng: 75.7873,   address: 'Jaipur, India' },
  'los angeles':  { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, USA' },
  'san francisco':{ lat: 37.7749, lng: -122.4194, address: 'San Francisco, USA' },
  'seoul':        { lat: 37.5665, lng: 126.9780,  address: 'Seoul, South Korea' },
  'berlin':       { lat: 52.5200, lng: 13.4050,   address: 'Berlin, Germany' },
  'lisbon':       { lat: 38.7223, lng: -9.1393,   address: 'Lisbon, Portugal' },
  'cairo':        { lat: 30.0444, lng: 31.2357,   address: 'Cairo, Egypt' },
  'cape town':    { lat: -33.9249, lng: 18.4241,  address: 'Cape Town, South Africa' },
  'prague':       { lat: 50.0755, lng: 14.4378,   address: 'Prague, Czech Republic' },
  'vienna':       { lat: 48.2082, lng: 16.3738,   address: 'Vienna, Austria' },
  'moscow':       { lat: 55.7558, lng: 37.6173,   address: 'Moscow, Russia' },
  'hong kong':    { lat: 22.3193, lng: 114.1694,  address: 'Hong Kong' },
  'kyoto':        { lat: 35.0116, lng: 135.7681,  address: 'Kyoto, Japan' },
  'osaka':        { lat: 34.6937, lng: 135.5023,  address: 'Osaka, Japan' },
  'miami':        { lat: 25.7617, lng: -80.1918,  address: 'Miami, USA' },
  'hawaii':       { lat: 21.3069, lng: -157.8583, address: 'Honolulu, Hawaii, USA' },
  'maldives':     { lat: 3.2028,  lng: 73.2207,   address: 'Maldives' },
  'santorini':    { lat: 36.3932, lng: 25.4615,   address: 'Santorini, Greece' },
  'athens':       { lat: 37.9838, lng: 23.7275,   address: 'Athens, Greece' },
  'zurich':       { lat: 47.3769, lng: 8.5417,    address: 'Zurich, Switzerland' },
  'switzerland':  { lat: 46.8182, lng: 8.2275,    address: 'Switzerland' },
  'toronto':      { lat: 43.6532, lng: -79.3832,  address: 'Toronto, Canada' },
  'vancouver':    { lat: 49.2827, lng: -123.1207, address: 'Vancouver, Canada' },
  'mexico city':  { lat: 19.4326, lng: -99.1332,  address: 'Mexico City, Mexico' },
  'cancun':       { lat: 21.1619, lng: -86.8515,  address: 'Cancun, Mexico' },
  'rio de janeiro':{ lat: -22.9068, lng: -43.1729,address: 'Rio de Janeiro, Brazil' },
  'buenos aires': { lat: -34.6037, lng: -58.3816, address: 'Buenos Aires, Argentina' },
  'marrakech':    { lat: 31.6295, lng: -7.9811,   address: 'Marrakech, Morocco' },
  'nairobi':      { lat: -1.2921,  lng: 36.8219,  address: 'Nairobi, Kenya' },
  'cusco':        { lat: -13.5320, lng: -71.9675, address: 'Cusco, Peru' },
  'machu picchu': { lat: -13.1631, lng: -72.5450, address: 'Machu Picchu, Peru' },
  'hanoi':        { lat: 21.0278, lng: 105.8342,  address: 'Hanoi, Vietnam' },
  'ho chi minh':  { lat: 10.8231, lng: 106.6297,  address: 'Ho Chi Minh City, Vietnam' },
  'kuala lumpur': { lat: 3.1390,  lng: 101.6869,  address: 'Kuala Lumpur, Malaysia' },
  'taipei':       { lat: 25.0330, lng: 121.5654,  address: 'Taipei, Taiwan' },
  'florence':     { lat: 43.7696, lng: 11.2558,   address: 'Florence, Italy' },
  'venice':       { lat: 45.4408, lng: 12.3155,   address: 'Venice, Italy' },
  'milan':        { lat: 45.4642, lng: 9.1900,    address: 'Milan, Italy' },
  'madrid':       { lat: 40.4168, lng: -3.7038,   address: 'Madrid, Spain' },
  'edinburgh':    { lat: 55.9533, lng: -3.1883,   address: 'Edinburgh, Scotland' },
  'dublin':       { lat: 53.3498, lng: -6.2603,   address: 'Dublin, Ireland' },
  'reykjavik':    { lat: 64.1466, lng: -21.9426,  address: 'Reykjavik, Iceland' },
  'stockholm':    { lat: 59.3293, lng: 18.0686,   address: 'Stockholm, Sweden' },
  'copenhagen':   { lat: 55.6761, lng: 12.5683,   address: 'Copenhagen, Denmark' },
  'phuket':       { lat: 7.8804,  lng: 98.3923,   address: 'Phuket, Thailand' },
  'petra':        { lat: 30.3285, lng: 35.4444,   address: 'Petra, Jordan' },
  'agra':         { lat: 27.1767, lng: 78.0081,   address: 'Agra, India' },
  'chennai':      { lat: 13.0827, lng: 80.2707,   address: 'Chennai, India' },
  'bangalore':    { lat: 12.9716, lng: 77.5946,   address: 'Bangalore, India' },
  'bengaluru':    { lat: 12.9716, lng: 77.5946,   address: 'Bengaluru, India' },
  'kolkata':      { lat: 22.5726, lng: 88.3639,   address: 'Kolkata, India' },
  'hyderabad':    { lat: 17.3850, lng: 78.4867,   address: 'Hyderabad, India' },
  'kerala':       { lat: 10.8505, lng: 76.2711,   address: 'Kerala, India' },
  'shimla':       { lat: 31.1048, lng: 77.1734,   address: 'Shimla, India' },
  'manali':       { lat: 32.2396, lng: 77.1887,   address: 'Manali, India' },
  'udaipur':      { lat: 24.5854, lng: 73.7125,   address: 'Udaipur, India' },
  'varanasi':     { lat: 25.3176, lng: 83.0064,   address: 'Varanasi, India' },
};

/**
 * Lookup from the built-in city database.
 * Matches partial city names (e.g., "Japan (Tokyo focus)" → matches "japan" or "tokyo")
 */
function lookupFallback(city) {
  if (!city) return null;
  const normalized = city.toLowerCase().trim();

  // Direct match
  if (CITY_COORDS[normalized]) return { ...CITY_COORDS[normalized] };

  // Partial match — check if any key is contained within the city string
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { ...coords };
    }
  }

  // Try extracting the first word (often the city name)
  const firstWord = normalized.split(/[\s(,]/)[0].trim();
  if (firstWord && CITY_COORDS[firstWord]) {
    return { ...CITY_COORDS[firstWord] };
  }

  return null;
}

/**
 * Geocode: city name → { lat, lng, address }
 * Strategy: Nominatim API → fallback database → null
 */
export async function geocode(city = '') {
  if (!city.trim()) return null;

  // 1) Try Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Tripify-App/2.0 (travel-planner)' },
      timeout: 5000,
    });

    if (res.data && res.data[0]) {
      return {
        lat:     parseFloat(res.data[0].lat),
        lng:     parseFloat(res.data[0].lon),
        address: res.data[0].display_name,
      };
    }
  } catch (err) {
    console.warn('Nominatim geocoding failed, using fallback:', err.message);
  }

  // 2) Fallback to built-in database
  const fallback = lookupFallback(city);
  if (fallback) {
    console.log(`Using fallback coordinates for "${city}"`);
    return fallback;
  }

  console.warn(`No coordinates found for "${city}"`);
  return null;
}
