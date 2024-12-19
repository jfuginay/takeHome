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

// Helper function to create an abortable fetch request
const createAbortableRequest = <T>(
  apiCall: () => Promise<T>,
  timeoutMs: number = 8000
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return apiCall()
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
    const data = await createAbortableRequest(() =>
      rest.options.aggregates(
        optionTicker,
        multiplier,
        timespan,
        from,
        to
      )
    );

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Calculate total volume from results
    const totalVolume = data.results.reduce((sum, day) => sum + (day.v || 0), 0);

    return {
      ticker: optionTicker,
      name: optionTicker, // Option contracts don't have names like stocks
      volume: totalVolume
    };
  } catch (e) {
    console.error(`Failed to fetch options data for ${optionTicker}:`, e);
    return null;
  }
};

export const stockRouter = createTRPCRouter({
  // Get active stocks with volume data
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
      if (input.dataType === "activeStocks") {
        try {
          const response = await createAbortableRequest(() =>
            rest.reference.tickers({
              active: true,
              limit: input.limit,
              market: "stocks"
            })
          );

          if (!response || !response.results) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No active stock data found",
            });
          }

          const activeStockData = response.results;

          // Fetch volume data for each active stock
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

          // Sort by volume and take top stocks based on limit
          const topStocksByVolume = stockVolumeData
            .sort((a, b) => b.volume - a.volume)
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
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid data type",
      });
    }),

  // Get options data for a specific ticker
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
        const data = await createAbortableRequest(() =>
          rest.options.aggregates(
            input.ticker,
            input.multiplier,
            input.timespan,
            input.from,
            input.to
          )
        );

        if (!data || !data.results) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No options data found for the specified ticker",
          });
        }

        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch options data",
        });
      }
    }),
});

export type StockRouter = typeof stockRouter;
