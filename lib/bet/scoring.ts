import { Bet, ExposureMap, parseId, createId } from './types'

export const scoreExposure = (exposure: ExposureMap, payoutMultiplier: number): number => {
  let maxCombo = 0
  const winnerTotals = Array(10).fill(0) as number[]
  const loserTotals = Array(10).fill(0) as number[]

  for (const [key, amount] of exposure.entries()) {
    const w = Number(key[0])
    const l = Number(key[1])
    const payout = amount * payoutMultiplier

    maxCombo = Math.max(maxCombo, payout)
    winnerTotals[w] += payout
    loserTotals[l] += payout
  }

  const winnerVariance = Math.max(...winnerTotals) - Math.min(...winnerTotals)
  const loserVariance = Math.max(...loserTotals) - Math.min(...loserTotals)

  // Weighted risk score
  return (
    maxCombo * 1.0 + // single-hit danger
    winnerVariance * 0.5 + // winner-digit clustering
    loserVariance * 0.5 // loser-digit clustering
  )
}

export interface CombinationScore {
  id: string // Format: "row-col"
  winnerDigit: number
  loserDigit: number
  score: number
}

export const getBestAvailableCombinations = (
  existingBets: Bet[],
  nextBetAmount: number,
  payoutMultiplier = 60
): CombinationScore[] => {
  const exposure: ExposureMap = new Map()

  // Build current exposure from bets using their id
  for (const bet of existingBets) {
    const { winnerDigit, loserDigit } = parseId(bet.id)
    const key = `${winnerDigit}${loserDigit}`
    exposure.set(key, (exposure.get(key) || 0) + bet.amount)
  }

  const results: CombinationScore[] = []
  const usedCombos = new Set(existingBets.map((b) => b.id))

  for (let w = 0; w <= 9; w++) {
    for (let l = 0; l <= 9; l++) {
      const id = createId(w, l)
      if (usedCombos.has(id)) continue // skip existing bets

      const key = `${w}${l}`
      // Simulate adding bet
      exposure.set(key, nextBetAmount)
      const riskScore = scoreExposure(exposure, payoutMultiplier)
      exposure.delete(key)

      results.push({
        id,
        winnerDigit: w,
        loserDigit: l,
        score: riskScore
      })
    }
  }

  // Lowest risk first
  return results.sort((a, b) => a.score - b.score)
}

// Get analysis summary for current bets
export interface BetAnalysis {
  totalExposure: number
  maxSinglePayout: number
  riskScore: number
  bestCombinations: CombinationScore[]
  worstCombinations: CombinationScore[]
  winnerDigitExposure: number[]
  loserDigitExposure: number[]
}

export const analyzeBets = (bets: Bet[], payoutMultiplier = 60): BetAnalysis => {
  const exposure: ExposureMap = new Map()
  const winnerDigitExposure = Array(10).fill(0) as number[]
  const loserDigitExposure = Array(10).fill(0) as number[]

  let totalExposure = 0
  let maxSinglePayout = 0

  // Build exposure map
  for (const bet of bets) {
    const { winnerDigit, loserDigit } = parseId(bet.id)
    const key = `${winnerDigit}${loserDigit}`
    const currentExposure = exposure.get(key) || 0
    exposure.set(key, currentExposure + bet.amount)

    const payout = bet.amount * payoutMultiplier
    totalExposure += payout
    maxSinglePayout = Math.max(maxSinglePayout, payout)

    winnerDigitExposure[winnerDigit] += payout
    loserDigitExposure[loserDigit] += payout
  }

  const riskScore = scoreExposure(exposure, payoutMultiplier)

  // Get best and worst combinations for next bet
  const avgAmount = bets.length > 0 ? bets.reduce((sum, b) => sum + b.amount, 0) / bets.length : 10
  const combinations = getBestAvailableCombinations(bets, avgAmount, payoutMultiplier)

  return {
    totalExposure,
    maxSinglePayout,
    riskScore,
    bestCombinations: combinations.slice(0, 5),
    worstCombinations: combinations.slice(-5).reverse(),
    winnerDigitExposure,
    loserDigitExposure
  }
}
