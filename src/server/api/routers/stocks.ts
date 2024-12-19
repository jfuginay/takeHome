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

    const totalVolume = data.results.reduce((sum: number, result) => {
      // The volume property 'v' might be undefined, so use nullish coalescing
      return sum + (result.v ?? 0);
    }, 0);

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

