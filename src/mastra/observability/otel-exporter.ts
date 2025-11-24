import type { TracingEvent } from '@mastra/core/observability';
import { TracingEventType } from '@mastra/core/observability';
import { BaseExporter, type BaseExporterConfig } from '@mastra/observability';

export interface OtelExporterConfig extends BaseExporterConfig {
  provider: {
    custom: {
      endpoint: string;
      protocol: 'http/json' | 'http/protobuf' | 'grpc';
      headers?: Record<string, string>;
    };
  };
  serviceName?: string;
}

export class OtelExporter extends BaseExporter {
  name = 'otel-exporter';
  private config: OtelExporterConfig;

  constructor(config: OtelExporterConfig) {
    super(config);
    this.config = config;

    if (!config.provider?.custom?.endpoint) {
      this.setDisabled('Missing OTLP endpoint');
      return;
    }
  }

  protected async _exportTracingEvent(event: TracingEvent): Promise<void> {
    if (this.isDisabled) {
      return;
    }

    // Only export completed spans (SPAN_ENDED events)
    // OTLP typically expects completed spans with end times
    if (event.type !== TracingEventType.SPAN_ENDED) {
      return;
    }

    const { endpoint, headers = {} } = this.config.provider.custom;
    const span = event.exportedSpan;

    try {
      // Convert Mastra ExportedSpan to OTLP format
      const otlpSpans = this.convertToOtlpFormat(span);

      // Validate that spans are present before sending
      const spanCount = otlpSpans.resourceSpans?.[0]?.scopeSpans?.[0]?.spans?.length || 0;
      if (spanCount === 0) {
        this.logger.warn(`No spans to export for span: ${span.name}`);
        return;
      }

      // Log payload structure for debugging
      this.logger.debug(`Exporting span: ${span.name}, traceId: ${span.traceId}, spanId: ${span.id}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(otlpSpans),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        this.logger.warn(
          `Failed to export trace: ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 200)}`
        );
        // Always log the full payload structure when there's an error to diagnose format issues
        const payloadStr = JSON.stringify(otlpSpans, null, 2);
        console.error(`[OTelExporter] Full OTLP payload:\n${payloadStr}`);
        console.error(`[OTelExporter] Span count: ${otlpSpans.resourceSpans?.[0]?.scopeSpans?.[0]?.spans?.length || 0}`);
        console.error(`[OTelExporter] Span path check:`, {
          hasResourceSpans: !!otlpSpans.resourceSpans,
          resourceSpansLength: otlpSpans.resourceSpans?.length,
          hasScopeSpans: !!otlpSpans.resourceSpans?.[0]?.scopeSpans,
          scopeSpansLength: otlpSpans.resourceSpans?.[0]?.scopeSpans?.length,
          hasSpans: !!otlpSpans.resourceSpans?.[0]?.scopeSpans?.[0]?.spans,
          spansLength: otlpSpans.resourceSpans?.[0]?.scopeSpans?.[0]?.spans?.length,
        });
      } else {
        this.logger.debug(`Successfully exported trace with span: ${span.name}`);
      }
    } catch (error) {
      this.logger.error(`Error exporting trace: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private convertToOtlpFormat(span: TracingEvent['exportedSpan']): any {
    // Convert Mastra ExportedSpan to OTLP JSON format
    const serviceName = this.config.serviceName || 'mastra-app';
    
    // OTLP JSON format uses hex strings directly (32 chars for traceId, 16 chars for spanId)
    // Ensure proper length: pad or truncate as needed
    const traceId = this.normalizeHexId(span.traceId, 32);
    const spanId = this.normalizeHexId(span.id, 16);
    const parentSpanId = span.parentSpanId ? this.normalizeHexId(span.parentSpanId, 16) : undefined;

    // Convert timestamps to nanoseconds (Unix epoch in nanoseconds)
    const startTimeUnixNano = span.startTime 
      ? BigInt(span.startTime.getTime()) * BigInt(1000000) 
      : BigInt(Date.now()) * BigInt(1000000);
    // For OTLP, endTime is required for completed spans
    // If endTime is missing, use current time (shouldn't happen for SPAN_ENDED events)
    const endTimeUnixNano = span.endTime 
      ? BigInt(span.endTime.getTime()) * BigInt(1000000) 
      : BigInt(Date.now()) * BigInt(1000000);

    const attributes = this.convertAttributes({
      ...span.attributes,
      'span.type': span.type,
      ...(span.metadata || {}),
    });

    if (span.input) {
      attributes.push({
        key: 'mastra.input',
        value: { stringValue: JSON.stringify(span.input) },
      });
    }

    if (span.output) {
      attributes.push({
        key: 'mastra.output',
        value: { stringValue: JSON.stringify(span.output) },
      });
    }

    if (span.errorInfo) {
      attributes.push({
        key: 'error',
        value: { boolValue: true },
      });
      attributes.push({
        key: 'error.message',
        value: { stringValue: span.errorInfo.message },
      });
    }

    return {
      resourceSpans: [
        {
          resource: {
            attributes: [
              {
                key: 'service.name',
                value: {
                  stringValue: serviceName,
                },
              },
            ],
          },
          scopeSpans: [
            {
              scope: {
                name: 'mastra',
                version: '1.0.0',
              },
              spans: [
                {
                  traceId: traceId,
                  spanId: spanId,
                  ...(parentSpanId && { parentSpanId }),
                  name: span.name || 'unknown',
                  kind: this.mapSpanKind(span.type),
                  startTimeUnixNano: startTimeUnixNano.toString(),
                  endTimeUnixNano: endTimeUnixNano.toString(),
                  // Always include attributes array (even if empty) for OTLP compliance
                  attributes: attributes.length > 0 ? attributes : [],
                  status: {
                    code: span.errorInfo ? 2 : 1, // 1 = OK, 2 = ERROR
                    ...(span.errorInfo?.message && { message: span.errorInfo.message }),
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  private normalizeHexId(hex: string, targetLength: number): string {
    // OTLP JSON format expects hex strings of specific lengths:
    // - traceId: 32 hex characters (16 bytes)
    // - spanId: 16 hex characters (8 bytes)
    // Remove any non-hex characters and pad/truncate to target length
    const cleaned = hex.replace(/[^0-9a-fA-F]/g, '');
    
    if (cleaned.length === targetLength) {
      return cleaned.toLowerCase();
    } else if (cleaned.length < targetLength) {
      // Pad with zeros
      return cleaned.toLowerCase().padStart(targetLength, '0');
    } else {
      // Truncate to target length
      return cleaned.substring(0, targetLength).toLowerCase();
    }
  }

  private mapSpanKind(type: string): number {
    // Map Mastra span types to OTLP span kinds
    // 1 = INTERNAL, 2 = SERVER, 3 = CLIENT, 4 = PRODUCER, 5 = CONSUMER
    const kindMap: Record<string, number> = {
      agent_run: 1,
      workflow_run: 1,
      tool_call: 3,
      model_generation: 3,
      model_step: 3,
      mcp_tool_call: 3,
      processor_run: 1,
    };

    return kindMap[type] || 1; // Default to INTERNAL
  }

  private convertAttributes(attributes: Record<string, any>): Array<{ key: string; value: any }> {
    return Object.entries(attributes).map(([key, value]) => {
      let otlpValue: any;

      if (typeof value === 'string') {
        otlpValue = { stringValue: value };
      } else if (typeof value === 'number') {
        otlpValue = { intValue: value.toString() };
      } else if (typeof value === 'boolean') {
        otlpValue = { boolValue: value };
      } else if (Array.isArray(value)) {
        otlpValue = { arrayValue: { values: value.map((v) => ({ stringValue: String(v) })) } };
      } else {
        otlpValue = { stringValue: JSON.stringify(value) };
      }

      return { key, value: otlpValue };
    });
  }
}
