import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import axios from "axios";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";

// Shared StockData interface
interface StockData {
  ticker: string;
  name: string;
  volume: number;
}

// Shared Stock interface for active stocks
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

const transformActiveStocksResponse = (data: any): ActiveStockData[] => {
  return data.results.map((stock: any) => ({
    ticker: stock.ticker,
    name: stock.name,
    market: stock.market,
    locale: stock.locale,
    primary_exchange: stock.primary_exchange,
    type: stock.type,
    active: stock.active,
    currency_name: stock.currency_name,
    last_updated_utc: stock.last_updated_utc,
  }));
};

// Fetch historical data for each stock to get the volume
const fetchStockVolumeData = async (ticker: string): Promise<StockData | null> => {
  try {
    const response = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev`,
        {
          params: {
            apiKey: env.POLYGON_API_KEY,
          },
        }
    );

    if (response.data && response.data.results && response.data.results[0]) {
      const stockData = response.data.results[0];
      return {
        ticker,
        name: ticker, // Assuming the name is the same as the ticker
        volume: stockData.v,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch volume data for ${ticker}:`, error);
    return null;
  }
};

export const stockRouter = createTRPCRouter({
  getStockData: protectedProcedure
      .input(
          z.object({
            dataType: z.enum(["activeStocks"]).default("activeStocks"),
          })
      )
      .query(async ({ input }) => {
        if (input.dataType === "activeStocks") {
          try {
            const activeStocksResponse = await axios.get(
                `https://api.polygon.io/v3/reference/tickers`,
                {
                  params: {
                    apiKey: env.POLYGON_API_KEY,
                    active: true,
                  },
                }
            );

            if (!activeStocksResponse.data || activeStocksResponse.data.results.length === 0) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No active stock data found",
              });
            }

            const activeStockData: ActiveStockData[] = transformActiveStocksResponse(activeStocksResponse.data);

            // Fetch volume data for each active stock (assuming a limit)
            const stockVolumeDataPromises = activeStockData.slice(0, 5000).map(stock => fetchStockVolumeData(stock.ticker));
            const stockVolumeData = (await Promise.all(stockVolumeDataPromises)).filter(data => data !== null) as StockData[];

            // Sort by volume and take the top 10
            const top1000StocksByVolume = stockVolumeData.sort((a, b) => b.volume - a.volume).slice(0, 1001);

            return { top1000StocksByVolume };
          } catch (error) {
            console.error(error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "An error occurred while fetching stock data",
            });
          }
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid data type",
          });
        }
      }),
});