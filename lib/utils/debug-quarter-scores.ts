/**
 * Debug utility to inspect quarter scores extraction
 */

export interface QuarterScoreDebugInfo {
  rawScores: number[]
  validScores: number[]
  homeTotal: number
  awayTotal: number
  extractedQuarters: {
    home: number[]
    away: number[]
  }
  formatAnalysis: Array<{
    format: string
    home: number[]
    away: number[]
    homeSum: number
    awaySum: number
    diff: number
  }>
}

export function debugQuarterScores(
  scores: number[],
  homeTotal: number,
  awayTotal: number
): QuarterScoreDebugInfo {
  // Valid quarter scores are typically 10-40 for basketball
  const validScores = scores.filter((s) => s >= 10 && s <= 45)

  const formatAnalysis: Array<{
    format: string
    home: number[]
    away: number[]
    homeSum: number
    awaySum: number
    diff: number
  }> = []

  if (validScores.length >= 8) {
    const first8 = validScores.slice(0, 8)

    // Sequential: home first 4, away next 4
    const sequential = {
      home: first8.slice(0, 4),
      away: first8.slice(4, 8)
    }
    formatAnalysis.push({
      format: 'Sequential (H1-4, A1-4)',
      ...sequential,
      homeSum: sequential.home.reduce((a, b) => a + b, 0),
      awaySum: sequential.away.reduce((a, b) => a + b, 0),
      diff: Math.abs(sequential.home.reduce((a, b) => a + b, 0) - homeTotal) +
        Math.abs(sequential.away.reduce((a, b) => a + b, 0) - awayTotal)
    })

    // Interleaved: h1,a1,h2,a2,h3,a3,h4,a4
    const interleaved = {
      home: [first8[0], first8[2], first8[4], first8[6]],
      away: [first8[1], first8[3], first8[5], first8[7]]
    }
    formatAnalysis.push({
      format: 'Interleaved (H1,A1,H2,A2...)',
      ...interleaved,
      homeSum: interleaved.home.reduce((a, b) => a + b, 0),
      awaySum: interleaved.away.reduce((a, b) => a + b, 0),
      diff: Math.abs(interleaved.home.reduce((a, b) => a + b, 0) - homeTotal) +
        Math.abs(interleaved.away.reduce((a, b) => a + b, 0) - awayTotal)
    })

    // Swapped interleaved: a1,h1,a2,h2,a3,a4,h4,a4
    const swappedInterleaved = {
      home: [first8[1], first8[3], first8[5], first8[7]],
      away: [first8[0], first8[2], first8[4], first8[6]]
    }
    formatAnalysis.push({
      format: 'Swapped Interleaved (A1,H1,A2,H2...)',
      ...swappedInterleaved,
      homeSum: swappedInterleaved.home.reduce((a, b) => a + b, 0),
      awaySum: swappedInterleaved.away.reduce((a, b) => a + b, 0),
      diff: Math.abs(swappedInterleaved.home.reduce((a, b) => a + b, 0) - homeTotal) +
        Math.abs(swappedInterleaved.away.reduce((a, b) => a + b, 0) - awayTotal)
    })
  }

  // Find best format
  const bestFormat = formatAnalysis.sort((a, b) => a.diff - b.diff)[0]

  return {
    rawScores: scores,
    validScores,
    homeTotal,
    awayTotal,
    extractedQuarters: bestFormat
      ? {
          home: bestFormat.home,
          away: bestFormat.away
        }
      : { home: [], away: [] },
    formatAnalysis
  }
}
