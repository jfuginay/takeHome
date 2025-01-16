import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "~/server/api/routers/user";
import { groupRouter } from "~/server/api/routers/group";
import { addressRouter } from "~/server/api/routers/address";
import { salesRouter } from "~/server/api/routers/sales";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  group: groupRouter,
  address: addressRouter,
  sales: salesRouter,
});

// Configuration for API endpoints
export const config = {
  api: {
    responseLimit: false,
  }
};

// export type definition of API
export type AppRouter = typeof appRouter;
