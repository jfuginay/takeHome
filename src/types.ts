import { Prisma } from '@prisma/client'

const coordinatesWithAddresses = Prisma.validator<Prisma.CoordinateArgs>()({
  include: {
    addresses: true
  },
})

const visitWithAddress = Prisma.validator<Prisma.VisitArgs>()({
  include: {
    address: true
  },
})

const addressWithVisits = Prisma.validator<Prisma.AddressArgs>()({
  include: {
    visits: true,
  },
})

export interface ChartDataset {
  label: string; // Label for the dataset, e.g., "Gamma Exposure"
  data: number[]; // Array of numeric values (for plotting)
  backgroundColor: string[]; // Colors for the bars, points, etc.
  borderColor: string[]; // Colors for borders of the elements
  borderWidth: number; // Thickness of the bar/point borders
}

export interface ChartData {
  labels: string[]; // Labels for the x-axis (e.g., strike prices)
  datasets: ChartDataset[]; // Array of datasets
}

const addressWithGroupsAndVisits = Prisma.validator<Prisma.AddressArgs>()({
  include: {
    group: true
  },
})

export type CoordinatesWithAddresses = Prisma.CoordinateGetPayload<
  typeof coordinatesWithAddresses
>

export type VisitWithAddress = Prisma.VisitGetPayload<
  typeof visitWithAddress
>

export type AddressWithVisits = Prisma.AddressGetPayload<
  typeof addressWithVisits
>

export type AddressWithGroupsAndVisits = Prisma.AddressGetPayload<
    typeof addressWithGroupsAndVisits
>

export type StockData = {
  quantity: number;
  symbol: string;
  change: number;
  changePercent: number;
}
