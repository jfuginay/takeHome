import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import { restClient } from '@polygon.io/client-js';

// Initialize the Polygon client
const rest = restClient(env.POLYGON_API_KEY);

// Interfaces
interface StockData {
  ticker: string;
  name: string;
  volume: number;
}

interface ActiveStockData {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  last_updated_utc: string;
}

interface PolygonResponse {
  results: ActiveStockData[];
  status: string;
  request_id: string;
  count?: number;
}

interface AggregateResult {
  v: number;
  vw?: number;
  o: number;
  c: number;
  h: number;
  l: number;
  t: number;
  n: number;
}

// Helper function to create an abortable fetch request
const createAbortableRequest = <T>(
  apiCall: (controller: AbortController) => Promise<T>,
  timeoutMs = 8000
): Promise<T | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return apiCall(controller)
    .catch(() => null)
    .finally(() => clearTimeout(timeoutId));
};

// Fetch historical data for each stock
const fetchOptionAggregateData = async (
  optionTicker: string,
  multiplier: number = 1,
  timespan: string = "day",
  from: string = "2023-01-09",
  to: string = "2023-01-09"
): Promise<StockData | null> => {
  try {
    const data = await createAbortableRequest(
      (controller) =>
        rest.options.aggregates(
          optionTicker,
          multiplier,
          timespan,
          from,
          to
        )
    );

    if (!data || !data.results || data.results.length === 0) {
      return null;
    }

    const totalVolume = data.results.reduce((sum: number, day: AggregateResult) => sum + (day.v || 0), 0);

    return {
      ticker: optionTicker,
      name: optionTicker,
      volume: totalVolume
    };
  } catch (e) {
    console.error(`Failed to fetch options data for ${optionTicker}:`, e);
    return null;
  }
};

export const stockRouter = createTRPCRouter({
  getStockData: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(["activeStocks"]).default("activeStocks"),
        limit: z.number().min(1).max(1000).default(100),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await createAbortableRequest(
          (controller) =>
            rest.reference.tickers({
              limit: input.limit,
              market: "stocks" as const
            })
        );

        if (!response || !response.results || response.results.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No active stock data found",
          });
        }

        const activeStockData: ActiveStockData[] = response.results;

        const stockVolumeDataPromises = activeStockData.map(stock =>
          fetchOptionAggregateData(
            stock.ticker,
            1,
            "day",
            input.from || "2023-01-09",
            input.to || "2023-01-09"
          )
        );

        const stockVolumeData = (await Promise.all(stockVolumeDataPromises))
          .filter((data): data is StockData => data !== null);

        const topStocksByVolume: StockData[] = stockVolumeData
          .slice(0, input.limit);

        return {
          stocks: topStocksByVolume,
          count: topStocksByVolume.length
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "An error occurred while fetching stock data",
        });
      }
    }),

  getOptionsData: protectedProcedure
    .input(
      z.object({
        ticker: z.string(),
        multiplier: z.number().min(1).default(1),
        timespan: z.enum(["minute", "hour", "day", "week", "month", "quarter", "year"]).default("day"),
        from: z.string(),
        to: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const data = await createAbortableRequest((controller) =>
          rest.options.aggregates(
            input.ticker.toUpperCase(),
            input.multiplier,
            input.timespan,
            input.from,
            input.to
          )
        );

        if (!data || !data.results || data.results.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No options data found for the specified ticker",
          });
        }

        return {
          results: data.results,
          status: data.status,
          requestId: data.request_id,
          count: data.count
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch options data",
        });
      }
    }),
});

export type StockRouter = typeof stockRouter;
