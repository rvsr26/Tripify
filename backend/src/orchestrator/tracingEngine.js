/**
 * Distributed Tracing & OpenTelemetry-Style Span Engine
 * Generates W3C-compatible trace/span trees for observability across HTTP, SSE, Mongo, and MCP.
 */

export class TraceSpanEngine {
  constructor(traceId) {
    this.traceId = traceId || `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.spans   = [];
    this.started = Date.now();
  }

  startSpan(name, category = 'internal', parentSpanId = null) {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const span = {
      spanId,
      traceId: this.traceId,
      parentSpanId,
      name,
      category, // 'mcp', 'mongo', 'cache', 'sse', 'llm'
      startTime: Date.now() - this.started,
      durationMs: 0,
      status: 'active',
    };
    this.spans.push(span);
    return {
      end: (status = 'ok', meta = {}) => {
        span.durationMs = Date.now() - this.started - span.startTime;
        span.status = status;
        span.meta = meta;
      },
      spanId,
    };
  }

  getTraceSummary() {
    return {
      traceId: this.traceId,
      totalDurationMs: Date.now() - this.started,
      spanCount: this.spans.length,
      spans: this.spans,
    };
  }
}
