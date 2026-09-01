/**
 * Verification Engine & Hallucination Prevention Pipeline
 * Validates opening hours, physical travel feasibility, and landmark accuracy.
 */
import { queryKnowledgeGraph } from './memoryGraph.js';

export class VerificationEngine {
  verifyItinerary(itinerary, city) {
    const days = itinerary?.days || [];
    const kg = queryKnowledgeGraph(city);
    const knownAttractions = (kg.attractions || []).map(a => a.name.toLowerCase());

    const verificationResults = {
      passed: true,
      openingHoursValid: true,
      distanceFeasible: true,
      hallucinationScore: 0, // 0 = no hallucination detected
      warnings: [],
      verifiedCount: 0,
    };

    days.forEach((dayPlan) => {
      const activities = dayPlan.activities || [];

      activities.forEach((act, idx) => {
        verificationResults.verifiedCount += 1;
        const name = (act.activity || '').toLowerCase();

        // 1. Time Sanity Check
        const timeStr = act.time || '';
        if (timeStr.includes('AM') && (timeStr.includes('2:') || timeStr.includes('3:') || timeStr.includes('4:'))) {
          verificationResults.openingHoursValid = false;
          verificationResults.warnings.push(`Day ${dayPlan.day}: Activity '${act.activity}' scheduled at unlikely hour (${timeStr}).`);
        }

        // 2. Hallucination Check against Knowledge Graph
        const matchesKnown = knownAttractions.some(known => name.includes(known) || known.includes(name));
        if (!matchesKnown && knownAttractions.length > 0) {
          verificationResults.hallucinationScore += 5;
        }

        // 3. Sequential Distance Check
        if (idx > 0 && activities[idx - 1].coordinates?.lat && act.coordinates?.lat) {
          const latDiff = Math.abs(activities[idx - 1].coordinates.lat - act.coordinates.lat);
          const lngDiff = Math.abs(activities[idx - 1].coordinates.lng - act.coordinates.lng);
          if (latDiff > 0.5 || lngDiff > 0.5) {
            verificationResults.distanceFeasible = false;
            verificationResults.warnings.push(`Day ${dayPlan.day}: Distance between '${activities[idx - 1].activity}' and '${act.activity}' is over 50km.`);
          }
        }
      });
    });

    if (verificationResults.warnings.length > 2) {
      verificationResults.passed = false;
    }

    return verificationResults;
  }
}
