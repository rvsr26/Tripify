/**
 * MCP Resources
 * Expose Tripify data as MCP-readable resources using standard URI patterns.
 * The AI host can read these to ground its responses in real user data.
 */
import TripPlan from '../../models/TripPlan.js';
import BucketList from '../../models/BucketList.js';
import Journal from '../../models/Journal.js';
import User from '../../models/User.js';

/**
 * Register all resources on the McpServer instance.
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
export function registerResources(server) {

  // trips://userId — list all trips for a user
  server.resource(
    'user-trips',
    'trips://user/{userId}',
    async (uri) => {
      const userId = uri.pathname.split('/').pop();
      const trips = await TripPlan.find({ 'members.userId': userId })
        .select('title city days budget estimatedCost createdAt selectedOption optionName impactTags scores')
        .sort({ createdAt: -1 })
        .lean();
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(trips, null, 2),
          mimeType: 'application/json',
        }],
      };
    },
  );

  // itinerary://tripId — full itinerary document
  server.resource(
    'trip-itinerary',
    'itinerary://trips/{tripId}',
    async (uri) => {
      const tripId = uri.pathname.split('/').pop();
      const trip = await TripPlan.findById(tripId)
        .select('title city days itinerary packingList expenses members chatHistory location')
        .lean();
      if (!trip) throw new Error(`Trip ${tripId} not found`);
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(trip, null, 2),
          mimeType: 'application/json',
        }],
      };
    },
  );

  // journal://tripId — all journal entries for a trip
  server.resource(
    'trip-journal',
    'journal://trips/{tripId}',
    async (uri) => {
      const tripId = uri.pathname.split('/').pop();
      const journal = await Journal.findOne({ tripId }).lean();
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(journal || { entries: [] }, null, 2),
          mimeType: 'application/json',
        }],
      };
    },
  );

  // bucketlist://userId — bucket list items
  server.resource(
    'user-bucketlist',
    'bucketlist://user/{userId}',
    async (uri) => {
      const userId = uri.pathname.split('/').pop();
      const bucket = await BucketList.findOne({ userId }).lean();
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(bucket || { items: [] }, null, 2),
          mimeType: 'application/json',
        }],
      };
    },
  );

  // profile://userId — user profile and preferences
  server.resource(
    'user-profile',
    'profile://user/{userId}',
    async (uri) => {
      const userId = uri.pathname.split('/').pop();
      const user = await User.findById(userId)
        .select('-passwordHash -refreshToken -fcmToken')
        .lean();
      if (!user) throw new Error(`User ${userId} not found`);
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(user, null, 2),
          mimeType: 'application/json',
        }],
      };
    },
  );
}
