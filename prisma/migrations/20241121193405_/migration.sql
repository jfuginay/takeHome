-- CreateTable
CREATE TABLE "StockData" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "strikePrice" DOUBLE PRECISION NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "contractType" TEXT NOT NULL,
    "exerciseStyle" TEXT NOT NULL,
    "sharesPerContract" INTEGER NOT NULL,
    "impliedVolatility" DOUBLE PRECISION NOT NULL,
    "openInterest" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "close" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "open" DOUBLE PRECISION,
    "previousClose" DOUBLE PRECISION,
    "volume" INTEGER,
    "vwap" DOUBLE PRECISION,

    CONSTRAINT "StockData_pkey" PRIMARY KEY ("id")
);
