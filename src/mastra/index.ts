import 'dotenv/config';
import { Mastra } from '@mastra/core/mastra';
import { ConsoleLogger } from '@mastra/core/logger';
import type { ObservabilityEntrypoint } from '@mastra/core/observability';
import { LibSQLStore } from '@mastra/libsql';
import { Observability, ConsoleExporter, DefaultExporter } from '@mastra/observability';
import { LangfuseExporter } from '@mastra/langfuse';
import { OtelExporter } from './observability/otel-exporter';
import { webAgent } from './agents';

export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: 'mastra-storage',
    // stores observability, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ':memory:',
  }),
  agents: { webAgent },
  logger: new ConsoleLogger({
    name: 'Mastra',
    level: 'info',
  }),
  // @ts-ignore - Version mismatch: @mastra/observability@1.0.0-beta.1 bundles @mastra/core@1.0.0-beta.3
  // while we use @mastra/core@1.0.0-beta.4. Runtime compatibility is fine per peer deps.
  observability: new Observability({
    configs: {
      local: {
        serviceName: 'browsing-agent',
        exporters: [
          // Console exporter for debugging - logs spans to console
          new ConsoleExporter(),
          // Default exporter - stores traces in Mastra storage (enables Mastra Studio)
          new DefaultExporter(),
          // Langfuse exporter - sends traces to Langfuse cloud
          new LangfuseExporter({
            publicKey: process.env.LANGFUSE_PUBLIC_KEY || 'pk-lf-1c89443a-233b-451c-a2cc-03607b302c68',
            secretKey: process.env.LANGFUSE_SECRET_KEY || 'sk-lf-e80f09f9-e939-48b1-ae9b-d34f1a4734af',
            baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
            realtime: process.env.NODE_ENV === 'development',
            options: {
              environment: process.env.NODE_ENV || 'development',
            },
          }),
          // Custom OTLP exporter - only enabled locally (not in cloud)
          ...(process.env.OTLP_ENDPOINT
            ? [
                new OtelExporter({
                  serviceName: 'browsing-agent',
                  provider: {
                    custom: {
                      endpoint: process.env.OTLP_ENDPOINT,
                      protocol: 'http/json',
                      headers: {
                        'x-integration-token': process.env.OTLP_TOKEN || '96ab041e-8a6a-40fc-bc9b-ce432c3db857',
                      },
                    },
                  },
                }),
              ]
            : []),
        ],
      },
      cloud: {
        serviceName: 'browsing-agent',
        exporters: [
          // Default exporter - stores traces in Mastra Cloud storage (enables Agent Studio)
          new DefaultExporter(),
          // Langfuse exporter - sends traces to Langfuse cloud
          ...(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY
            ? [
                new LangfuseExporter({
                  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
                  secretKey: process.env.LANGFUSE_SECRET_KEY,
                  baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
                  realtime: false, // Batch mode for production
                  options: {
                    environment: 'production',
                  },
                }),
              ]
            : []),
        ],
      },
    },
    configSelector: () => {
      // Use 'cloud' config when deployed on Mastra Cloud, 'local' otherwise
      return process.env.MASTRA_CLOUD === 'true' || process.env.NODE_ENV === 'production' ? 'cloud' : 'local';
    },
  }),
});
