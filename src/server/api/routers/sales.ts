import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getDatabaseConnection } from "~/server/database/client";

// Fetch sales data for chart
const fetchSalesChartData = async (
  start: string,
  end: string
): Promise<{ time: string; totalSales: number }[]> => {
  try {
    const db = await getDatabaseConnection(); // Connect to the cloud MongoDB
    const salesData = await db
      .collection("sales") // Access the "sales" collection
      .find({ date: { $gte: start, $lte: end } }) // Query based on date range
      .sort({ date: 1 }) // Sort by date ascending
      .toArray();

    if (!salesData || salesData.length === 0) {
      return [];
    }

    // Transform the data into a format suitable for the chart
    return salesData.map((entry) => ({
      time: entry.date, // Assuming the date field exists in the collection
      totalSales: entry.totalSales ?? 0,
    }));
  } catch (e) {
    console.error(`Failed to fetch sales chart data:`, e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not fetch sales chart data.",
    });
  }
};

// Define the router
export const salesRouter = createTRPCRouter({
  getSalesChartData: protectedProcedure
    .input(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { start, end } = input;

      const result = await fetchSalesChartData(start, end);

      if (!result || result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No sales data found for the specified range.`,
        });
      }

      return result;
    }),
});
