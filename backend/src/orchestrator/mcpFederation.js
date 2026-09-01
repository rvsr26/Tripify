/**
 * MCP Federation & Capability Discovery Engine
 * Federated discovery & capability negotiation across local and remote MCP servers.
 */

export class McpFederationRegistry {
  constructor() {
    this.federatedServers = new Map();
    this.registerLocalServers();
  }

  registerLocalServers() {
    this.federatedServers.set('tripify-core', {
      name: 'Tripify Core MCP',
      endpoint: '/api/mcp',
      status: 'active',
      capabilities: ['planning', 'itinerary', 'packing', 'emergency'],
      toolsCount: 10,
    });
    this.federatedServers.set('weather-mcp', {
      name: 'Weather MCP Server',
      endpoint: 'https://weather.tripify.app/mcp',
      status: 'active',
      capabilities: ['weather', 'forecast', 'climate'],
      toolsCount: 3,
    });
    this.federatedServers.set('finance-mcp', {
      name: 'Finance & Split MCP',
      endpoint: 'https://finance.tripify.app/mcp',
      status: 'active',
      capabilities: ['expenses', 'debt_settlement', 'currency'],
      toolsCount: 5,
    });
    this.federatedServers.set('social-mcp', {
      name: 'Social & Matchmaking MCP',
      endpoint: 'https://social.tripify.app/mcp',
      status: 'active',
      capabilities: ['friend_match', 'tribes', 'stories'],
      toolsCount: 5,
    });
  }

  discoverCapabilities(domain) {
    const matched = [];
    for (const [id, server] of this.federatedServers.entries()) {
      if (server.capabilities.includes(domain) || domain === 'all') {
        matched.push({ id, ...server });
      }
    }
    return matched;
  }

  getFederationSummary() {
    return {
      activeFederatedServers: this.federatedServers.size,
      servers: Array.from(this.federatedServers.values()),
    };
  }
}

export const mcpFederation = new McpFederationRegistry();
