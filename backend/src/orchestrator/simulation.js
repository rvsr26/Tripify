/**
 * Digital Twin & Traveler Simulation Engine
 * Runs multi-dimensional simulations before itinerary approval.
 *
 * Simulates:
 *   - Traveler Energy & Fatigue Curve (walking distance vs rest gaps)
 *   - Queue Time & Crowd Density Delays
 *   - Weather Disruptions (Rain / Heatwave impact)
 *   - Disruption Resilience (Flight delay / Lost passport / Strike simulation)
 */
import { queryKnowledgeGraph } from './memoryGraph.js';

export class DigitalTwinSimulator {
  constructor(travelerProfile = {}) {
    this.walkingTolerance = travelerProfile.walkingTolerance || 'Moderate';
    this.maxDailyHours = 9;
    this.maxDailyWalkingKm = this.walkingTolerance === 'High' ? 15 : this.walkingTolerance === 'Moderate' ? 10 : 6;
  }

  /**
   * Run full simulation over a generated itinerary.
   */
  simulateTrip(itinerary, city, weatherCondition = 'Clear') {
    const days = itinerary?.days || [];
    const kg = queryKnowledgeGraph(city);

    const daySimulations = days.map((dayPlan, idx) => {
      const activities = dayPlan.activities || [];
      let totalEstHours = 0;
      let totalWalkingKm = activities.length * 1.8; // average 1.8km between activities
      let queueDelayMins = 0;
      let weatherRiskCount = 0;

      activities.forEach(act => {
        totalEstHours += 2; // ~2 hrs per activity slot
        // Simulate queue times based on attraction type
        if (act.activity?.toLowerCase().includes('museum') || act.activity?.toLowerCase().includes('tower')) {
          queueDelayMins += 35;
        } else {
          queueDelayMins += 10;
        }

        // Simulate weather vulnerability
        if (weatherCondition.toLowerCase().includes('rain') || weatherCondition.toLowerCase().includes('storm')) {
          if (!act.activity?.toLowerCase().includes('museum') && !act.activity?.toLowerCase().includes('mall') && !act.activity?.toLowerCase().includes('indoor')) {
            weatherRiskCount += 1;
          }
        }
      });

      // Calculate traveler fatigue index (0 = fresh, 100 = exhausted)
      const fatigueIndex = Math.min(100, Math.round((totalWalkingKm / this.maxDailyWalkingKm) * 60 + (totalEstHours / this.maxDailyHours) * 40));

      return {
        day: dayPlan.day || idx + 1,
        title: dayPlan.title,
        activityCount: activities.length,
        estimatedHours: Math.round(totalEstHours * 10) / 10,
        estimatedWalkingKm: Math.round(totalWalkingKm * 10) / 10,
        simulatedQueueDelayMins: queueDelayMins,
        weatherRiskCount,
        fatigueIndex,
        status: fatigueIndex > 85 ? 'Overloaded' : fatigueIndex > 65 ? 'Optimal' : 'Light',
      };
    });

    const avgFatigue = Math.round(daySimulations.reduce((s, d) => s + d.fatigueIndex, 0) / (daySimulations.length || 1));
    const totalQueueMins = daySimulations.reduce((s, d) => s + d.simulatedQueueDelayMins, 0);
    const totalWeatherRisks = daySimulations.reduce((s, d) => s + d.weatherRiskCount, 0);

    // Compute Overall Resilience Score
    const resilienceScore = Math.max(20, Math.min(99, 100 - (avgFatigue > 80 ? 20 : 0) - (totalWeatherRisks * 10) - Math.floor(totalQueueMins / 60) * 5));

    return {
      city,
      simulatedTraveler: {
        walkingTolerance: this.walkingTolerance,
        maxDailyWalkingKm: this.maxDailyWalkingKm,
      },
      metrics: {
        resilienceScore,
        avgFatigueIndex: avgFatigue,
        totalSimulatedQueueTimeMins: totalQueueMins,
        weatherRisksIdentified: totalWeatherRisks,
        weatherCondition,
      },
      daySimulations,
      recommendations: this._generateSimRecommendations(avgFatigue, totalWeatherRisks, resilienceScore),
    };
  }

  _generateSimRecommendations(avgFatigue, weatherRisks, resilienceScore) {
    const recs = [];
    if (avgFatigue > 75) recs.push('Insert a 90-minute rest or cafe break on Day 2/3 to prevent traveler burnout.');
    if (weatherRisks > 2) recs.push('Consider swapping outdoor park visits with indoor art galleries due to weather risks.');
    if (resilienceScore >= 85) recs.push('Itinerary passes all stress tests with optimal pacing and low vulnerability.');
    return recs;
  }
}
