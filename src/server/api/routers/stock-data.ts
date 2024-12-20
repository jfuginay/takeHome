import { NextApiRequest, NextApiResponse } from 'next';
import { restClient } from "@polygon.io/client-js";
import { env } from "~/env.mjs";

const rest = restClient(env.POLYGON_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[DEBUG] Incoming request: ${req.method} ${req.url}`);
  console.log('[DEBUG] Request headers:', req.headers);
  const { symbol } = req.query;

  console.log('[DEBUG] Query parameters:', req.query);
  if (!symbol || typeof symbol !== 'string') {
    console.log('[DEBUG] Validation error: Symbol is required or invalid');

    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    console.log('[DEBUG] Fetching stock data for symbol:', symbol);
    const data = await rest.options.aggregates(
      symbol,
      1,
      "day",
      "2023-01-01",
      "2023-04-14"
    );

    console.log('[DEBUG] Successfully fetched data:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('[DEBUG] Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
