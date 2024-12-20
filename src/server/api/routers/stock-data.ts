import { NextApiRequest, NextApiResponse } from 'next';
import { restClient } from "@polygon.io/client-js";
import { env } from "~/env.mjs";
import { z } from "zod";

const rest = restClient(env.POLYGON_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[DEBUG] Incoming request: ${req.method} ${req.url}`);
  console.log('[DEBUG] Request headers:', req.headers);
  const { symbol } = req.query;
  const todayString = new Date().toISOString().split('T')[0];
  const querySchema = z.object({
    symbol: z.string().nonempty("Symbol is required"),
    from: z.string().optional().default(todayString),
    to: z.string().optional().default(todayString),
  });

  console.log('[DEBUG] Query parameters:', req.query);

  try {
    const parsedQuery = querySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      console.log('[DEBUG] Validation error:', parsedQuery.error.errors);
      return res.status(400).json({ error: parsedQuery.error.errors });
    }
    const { symbol, from, to } = parsedQuery.data;

    console.log(`[DEBUG] Fetching stock data for symbol: ${symbol}, from: ${from}, to: ${to}`);
    const data = await rest.options.aggregates(
      symbol,
      1,
      "day",
      from,
      to
    );

    console.log('[DEBUG] Successfully fetched data:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('[DEBUG] Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
