// Unified type matching PlayCardItem structure
export type Bet = {
  id: string // Format: "row-col" (e.g., "0-0", "5-3") where row=winnerDigit, col=loserDigit
  name: string
  amount: number
  notes?: string
}

export type ExposureMap = Map<string, number> // "64" -> payout exposure

// Helper to extract digits from id
export const parseId = (id: string): { winnerDigit: number; loserDigit: number } => {
  const [row, col] = id.split('-').map(Number)
  return { winnerDigit: row, loserDigit: col }
}

// Helper to create id from digits
export const createId = (winnerDigit: number, loserDigit: number): string => {
  return `${winnerDigit}-${loserDigit}`
}

// . Core idea of the algorithm

// For every possible unused combo (00–99):

// Simulate adding the new bet
// Measure:
// Max exposure of any combo
// Winner-digit imbalance
// Loser-digit imbalance
// Score it
// Pick the lowest-risk score
// Lower score = better combo to offer next.
