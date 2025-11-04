import TripPlan from '../models/TripPlan.js';
import User from '../models/User.js';

export const eliteService = {
  /**
   * Analyzes itinerary for "Cultural" and "Eco-friendly" keywords to award points.
   */
  async calculateTripROI(tripId) {
    const trip = await TripPlan.findById(tripId);
    if (!trip || !trip.itinerary) return;

    let culturalPoints = 0;
    let sustainabilityPoints = 0;
    const impactTags = [];

    const itineraryString = JSON.stringify(trip.itinerary).toLowerCase();

    // Keywords for Culture
    const cultureKeywords = ['museum', 'gallery', 'historic', 'heritage', 'temple', 'shrine', 'cultural', 'local expert', 'tradition'];
    cultureKeywords.forEach(kw => {
      if (itineraryString.includes(kw)) culturalPoints += 15;
    });

    // Keywords for Sustainability 
    const ecoKeywords = ['train', 'walking', 'bicycle', 'eco-friendly', 'local market', 'veg', 'sustainable', 'offset'];
    ecoKeywords.forEach(kw => {
      if (itineraryString.includes(kw)) sustainabilityPoints += 15;
    });

    if (culturalPoints > 30) impactTags.push('Historical Heritage');
    if (sustainabilityPoints > 30) impactTags.push('Eco-Conscious');

    trip.scores.culturalDepth = culturalPoints;
    trip.scores.sustainability = sustainabilityPoints;
    trip.impactTags = impactTags;
    await trip.save();

    // Award XP to the admin/creator
    const user = await User.findById(trip.userId);
    if (user) {
      user.travelROI.culturalDepth += culturalPoints;
      user.travelROI.sustainabilityScore += sustainabilityPoints;
      user.membership.experiencePoints += (culturalPoints + sustainabilityPoints);
      
      // Tier Upgrade Logic
      const xp = user.membership.experiencePoints;
      if (xp > 5000) user.membership.tier = 'Elite';
      else if (xp > 2000) user.membership.tier = 'Gold';
      else if (xp > 500) user.membership.tier = 'Silver';
      
      await user.save();
    }
  },

  /**
   * Detects if multiple members have overlapping schedules or distance conflicts.
   */
  async resolvePlanConflicts(tripId) {
    const trip = await TripPlan.findById(tripId);
    if (!trip || !trip.itinerary) return [];

    const conflicts = [];
    // Simplified logic: Check if two events in the same day have similar time strings
    // In a production app, we'd use a more robust temporal comparison
    const iten = trip.itinerary;
    if (Array.isArray(iten)) {
      iten.forEach((day, dayIdx) => {
        const events = day.activities || [];
        // Detect duplicates or too-close timings
        const times = new Set();
        events.forEach(ev => {
          if (times.has(ev.startTime)) {
            conflicts.push({
              type: 'TIME_OVERLAP',
              message: `Conflict on Day ${dayIdx + 1}: ${ev.title} overlaps with another activity at ${ev.startTime}.`,
              suggestion: 'Suggest shifting one activity 2 hours later.'
            });
          }
          times.add(ev.startTime);
        });
      });
    }

    return conflicts;
  }
};
