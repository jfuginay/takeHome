import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import axios from "axios";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import { AllowAccess, RoleSets } from "~/server/middleware/roles";

export const stockRouter = createTRPCRouter({
  create: protectedProcedure
    .use(AllowAccess(RoleSets.admins))
    .input(
      z.object({
        strikePriceMin: z.number(),
        strikePriceMax: z.number(),
        expirationDate: z.string(),
        limit: z.number().default(250),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await axios.get(
          `https://api.polygon.io/v3/snapshot/options/SPY`, 
          {
            params: {
              'strike_price.gte': input.strikePriceMin,
              'strike_price.lte': input.strikePriceMax,
              'expiration_date.lte': input.expirationDate,
              limit: input.limit,
              sort: 'expiration_date',
              apiKey: env.POLYGON_API_KEY as string,
            },
          }
        );

        // Check if the response data is valid
        if (!response.data || response.data.results.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No options found for the given criteria",
          });
        }

        // Process the response to store stock-related variables
        interface StockData {
          change: number;
          changePercent: number;
          close: number;
          high: number;
          low: number;
          open: number;
          previousClose: number;
          volume: number;
          vwap: number;
          contractType: string;
          exerciseStyle: string;
          expirationDate: string;
          sharesPerContract: number;
          strikePrice: number;
          ticker: string;
          impliedVolatility: number;
          openInterest: number;
          underlyingAssetTicker: string;
          greeks: {
            delta: number;
            gamma: number;
            theta: number;
            vega: number;
          };
        }

        const stockData: StockData[] = response.data.results.map((option: any) => ({
          change: option.day.change,
          changePercent: option.day.change_percent,
          close: option.day.close,
          high: option.day.high,
          low: option.day.low,
          open: option.day.open,
          previousClose: option.day.previous_close,
          volume: option.day.volume,
          vwap: option.day.vwap,
          contractType: option.details.contract_type,
          exerciseStyle: option.details.exercise_style,
          expirationDate: option.details.expiration_date,
          sharesPerContract: option.details.shares_per_contract,
          strikePrice: option.details.strike_price,
          ticker: option.details.ticker,
          impliedVolatility: option.implied_volatility,
          openInterest: option.open_interest,
          underlyingAssetTicker: option.underlying_asset.ticker,
          greeks: {
            delta: option.greeks.delta,
            gamma: option.greeks.gamma,
            theta: option.greeks.theta,
            vega: option.greeks.vega,
          },
        }));

        // Return the stock options
        return {
          stockData,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching stock options",
        });
      }
    }),

  getStockData: protectedProcedure
    .use(AllowAccess(RoleSets.admins))
    .query(async () => {
      try {
        const response = await axios.get(
          `https://api.polygon.io/v3/snapshot/options/SPY`, 
          {
            params: {
              apiKey: env.POLYGON_API_KEY as string,
            },
          }
        );

        // Check if the response data is valid
        if (!response.data || response.data.results.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No stock data found",
          });
        }

        // Process the response to store stock-related variables
        interface StockData {
          quantity: ReactNode;
          symbol: string;
          change: number;
          changePercent: number;
          close: number;
          high: number;
          low: number;
          open: number;
          previousClose: number;
          volume: number;
          vwap: number;
          contractType: string;
          exerciseStyle: string;
          expirationDate: string;
          sharesPerContract: number;
          strikePrice: number;
          ticker: string;
          impliedVolatility: number;
          openInterest: number;
          underlyingAssetTicker: string;
          greeks: {
            delta: number;
            gamma: number;
            theta: number;
            vega: number;
          };
        }

        const stockData: StockData[] = response.data.results.map((option: any) => ({
          change: option.day.change,
          changePercent: option.day.change_percent,
          close: option.day.close,
          high: option.day.high,
          low: option.day.low,
          open: option.day.open,
          previousClose: option.day.previous_close,
          volume: option.day.volume,
          vwap: option.day.vwap,
          contractType: option.details.contract_type,
          exerciseStyle: option.details.exercise_style,
          expirationDate: option.details.expiration_date,
          sharesPerContract: option.details.shares_per_contract,
          strikePrice: option.details.strike_price,
          ticker: option.details.ticker,
          impliedVolatility: option.implied_volatility,
          openInterest: option.open_interest,
          underlyingAssetTicker: option.underlying_asset.ticker,
          greeks: {
            delta: option.greeks.delta,
            gamma: option.greeks.gamma,
            theta: option.greeks.theta,
            vega: option.greeks.vega,
          },
        }));

        // Return the stock data
        return {
          stockData,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching stock data",
        });
      }
    }),
});
