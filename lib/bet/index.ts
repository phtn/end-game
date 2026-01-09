import { getBestAvailableCombinations } from './scoring'
import { Bet } from './types'

export const getBestBets = (existingBets: Array<Bet>) => getBestAvailableCombinations(existingBets, 100)

// Show top 5 safest options
// best.slice(0, 5);
