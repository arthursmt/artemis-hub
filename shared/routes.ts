
import { z } from 'zod';
import { insertProposalSchema, proposals, contracts } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  proposals: {
    list: {
      method: 'GET' as const,
      path: '/api/proposals',
      responses: {
        200: z.array(z.custom<typeof proposals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/proposals',
      input: insertProposalSchema,
      responses: {
        201: z.custom<typeof proposals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  contracts: {
    list: {
      method: 'GET' as const,
      path: '/api/contracts',
      responses: {
        200: z.array(z.custom<typeof contracts.$inferSelect>()),
      },
    },
  },
  kpis: {
    get: {
      method: 'GET' as const,
      path: '/api/kpis',
      responses: {
        200: z.object({
          creditPortfolio: z.number(),
          activeClients: z.number(),
          delinquencyRate: z.string(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
