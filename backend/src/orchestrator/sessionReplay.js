/**
 * Execution Session Replayer
 * Records complete agent session trajectories (tool calls, reasoning, memory lookups, debate turns)
 * and allows step-by-step playback.
 */

class SessionReplayStore {
  constructor() {
    this.sessions = new Map(); // sessionId -> trajectory array
  }

  recordStep(sessionId, step) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    this.sessions.get(sessionId).push({
      stepIndex: this.sessions.get(sessionId).length + 1,
      timestamp: Date.now(),
      ...step,
    });
  }

  getTrajectory(sessionId) {
    return this.sessions.get(sessionId) || [];
  }

  getAllSessions() {
    const list = [];
    for (const [id, steps] of this.sessions.entries()) {
      list.push({ sessionId: id, stepCount: steps.length, startedAt: steps[0]?.timestamp });
    }
    return list;
  }
}

export const sessionReplayStore = new SessionReplayStore();
