// import { Window } from 'happy-dom'

export interface MatchScore {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  quarterScores: {
    home: number[]
    away: number[]
  }
  period?: string // e.g., "Q1", "Q2", "HT", "OT"
  timeRemaining?: string // e.g., "5:35", "2:15"
  _debug?: {
    rawScores: number[]
    validScores: number[]
  }
}

// Known PBA team names for better matching
const PBA_TEAMS = [
  'S.M. Beermen',
  'San Miguel Beermen',
  'SMB',
  'Barangay Ginebra',
  'Ginebra',
  'Brgy. Ginebra',
  'Talk N Text',
  'TNT',
  'Tropang Giga',
  'TNT Tropang Giga',
  'Meralco',
  'Meralco Bolts',
  'Bolts',
  'Magnolia',
  'Magnolia Hotshots',
  'Hotshots',
  'Phoenix',
  'Phoenix Fuel Masters',
  'Fuel Masters',
  'Rain or Shine',
  'ROS',
  'Elasto Painters',
  'NorthPort',
  'Batang Pier',
  'NorthPort Batang Pier',
  'Alaska',
  'Alaska Aces',
  'Aces',
  'NLEX',
  'Road Warriors',
  'NLEX Road Warriors',
  'Blackwater',
  'Bossing',
  'Blackwater Bossing',
  'Terrafirma',
  'Dyip',
  'Terrafirma Dyip',
  'Converge',
  'FiberXers',
  'Converge FiberXers'
]

// Parse match text like: "Pin match END S.M. Beermen Barangay Ginebra ‌ 93 ‌ 84 ‌ 12 ‌ 19..."
function parseMatchText(text: string): { homeTeam: string; awayTeam: string; status: string; scores: number[]; period?: string; timeRemaining?: string } | null {
  // Remove common prefixes and UI elements
  let cleanText = text
    .replace(/^Pin match\s*/i, '')
    .replace(/\u200C/g, ' ')
    .replace(/\u200B/g, ' ') // Zero-width space
    .replace(/Open quick\s*stats?/gi, '')
    .replace(/T\s+\d\s+\d\s+\d\s+\d/gi, '') // Remove "T 1 2 3 4" headers
    .replace(/\b[XY]\s*[\d.]+/gi, '') // Remove odds like "X 11.00"
    .trim()

  // Extract status, period, and time remaining
  let status = 'LIVE'
  let period: string | undefined
  let timeRemaining: string | undefined

  // Try to extract period and time first (anywhere in text for more flexibility)
  // Pattern: Q1 5:35, Q2 2:15, HT, OT, etc.
  const periodTimePatterns = [
    // Quarter with time patterns
    { pattern: /\b(Q[1-4])\s*(\d{1,2}:\d{2})\b/i, periodGroup: 1, timeGroup: 2 },
    { pattern: /\b(Q[1-4])\s*(\d{1,2}['′])\b/i, periodGroup: 1, timeGroup: 2 },
    { pattern: /\b(Q[1-4])\b/i, periodGroup: 1 },
    // Halftime - expanded patterns
    { pattern: /\b(HT|HALFTIME|HALF[-\s]?TIME|1ST\s*HALF|2ND\s*HALF)\b/i, periodGroup: 1 },
    { pattern: /\bHALF\b/i, periodGroup: 0 }, // Standalone "Half"
    // Overtime
    { pattern: /\b(OT|OVERTIME)\s*(\d{1,2}:\d{2})?\b/i, periodGroup: 1, timeGroup: 2 },
    // Time only (if no quarter found later)
    { pattern: /\b(\d{1,2}:\d{2})\s*(?:left|remaining)?/i, timeGroup: 1 },
    { pattern: /\b(\d{1,2})['′]\s*(?:left|remaining)?/i, timeGroup: 1 },
  ]

  for (const { pattern, periodGroup, timeGroup } of periodTimePatterns) {
    const match = cleanText.match(pattern)
    if (match) {
      if (periodGroup !== undefined && match[periodGroup]) {
        const matchedPeriod = match[periodGroup].toUpperCase()
        if (matchedPeriod.match(/^Q[1-4]/)) {
          period = matchedPeriod
        } else if (matchedPeriod.match(/^(HT|HALFTIME|HALF)/i)) {
          period = 'HT'
        } else if (matchedPeriod.match(/^(1ST|2ND)\s*HALF/i)) {
          period = 'HT'
        } else if (matchedPeriod.match(/^(OT|OVERTIME)/i)) {
          period = 'OT'
        }
      }
      if (timeGroup !== undefined && match[timeGroup]) {
        timeRemaining = match[timeGroup]
      }
      // Remove matched text from cleanText
      cleanText = cleanText.replace(match[0], ' ').trim()
      break
    }
  }

  // Extract status (LIVE, END, Ended, HT, Q1-Q4, etc.)
  // Order matters: specific statuses (HT, Q1-Q4, OT) should be checked before generic LIVE
  const statusPatterns = [
    { pattern: /\bEnded\s*END\b/i, status: 'END' },
    { pattern: /\bEND(?:ED)?\b/i, status: 'END' },
    { pattern: /\bFINAL\b/i, status: 'END' },
    { pattern: /\b(HT|HALFTIME|HALF[-\s]?TIME)\b/i, status: 'HT' },
    { pattern: /\bQ([1-4])\b/i, status: 'LIVE' },
    { pattern: /\bOT\b/i, status: 'LIVE' },
    { pattern: /\bLIVE\b/i, status: 'LIVE' }, // Check LIVE last
  ]

  for (const { pattern, status: matchedStatus } of statusPatterns) {
    const match = cleanText.match(pattern)
    if (match) {
      status = matchedStatus
      // If we matched Q1-Q4 and don't have period yet, extract it
      if (!period && match[1] && matchedStatus === 'LIVE' && match[0].match(/^Q[1-4]/i)) {
        period = `Q${match[1]}`
      } else if (!period && matchedStatus === 'HT') {
        period = 'HT'
      } else if (!period && match[0].toUpperCase() === 'OT') {
        period = 'OT'
      }
      cleanText = cleanText.replace(match[0], ' ').trim()
      break
    }
  }

  // Extract all numbers (potential scores) - only valid basketball scores
  // Store positions to help identify team boundaries
  const numberMatches: Array<{ value: number; index: number }> = []
  const numberRegex = /\b(\d{1,3})\b/g
  let match: RegExpExecArray | null
  while ((match = numberRegex.exec(cleanText)) !== null) {
    const num = parseInt(match[1], 10)
    if (num >= 0 && num <= 150) {
      numberMatches.push({ value: num, index: match.index })
    }
  }
  const scores = numberMatches.map((m) => m.value)

  if (scores.length < 2) return null

  // Find the first score position to split team names from scores
  const firstScoreIndex = numberMatches[0]?.index ?? cleanText.length
  const teamNamesText = cleanText.slice(0, firstScoreIndex).trim()

  // Try to find known PBA team names first (longest match first for better accuracy)
  const sortedTeams = [...PBA_TEAMS].sort((a, b) => b.length - a.length)
  const foundTeams: Array<{ name: string; index: number }> = []
  let searchText = teamNamesText

  for (const team of sortedTeams) {
    const regex = new RegExp(team.replace(/[.]/g, '\\.').replace(/\s+/g, '\\s+'), 'i')
    const match = searchText.match(regex)
    if (match && match.index !== undefined) {
      foundTeams.push({ name: team, index: match.index })
      // Replace with placeholder to avoid overlapping matches
      searchText = searchText.replace(regex, '|||TEAM_PLACEHOLDER|||')
      if (foundTeams.length >= 2) break
    }
  }

  // Sort found teams by their position in the original text
  foundTeams.sort((a, b) => a.index - b.index)

  if (foundTeams.length >= 2) {
    return {
      homeTeam: foundTeams[0].name,
      awayTeam: foundTeams[1].name,
      status: status === 'END' ? 'ENDED' : status,
      scores,
      period,
      timeRemaining
    }
  }

  // Fallback: Extract team names by splitting on numbers and cleaning
  // Remove all numbers and split by multiple spaces or special separators
  const teamText = teamNamesText
    .replace(/\b\d+\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Try to split by common patterns
  const separators = [/\s+vs\s+/i, /\s+-\s+/, /\s{2,}/, /\s+/]
  let parts: string[] = []

  for (const separator of separators) {
    const split = teamText
      .split(separator)
      .map((p) => p.trim())
      .filter((p) => p.length > 2)
    if (split.length >= 2) {
      parts = split
      break
    }
  }

  // If no clear split, try to find two capitalized phrases
  if (parts.length < 2) {
    // Match capitalized words/phrases (team names)
    const capitalizedMatches = teamText.match(/(?:[A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*|[A-Z][.][A-Z][.]\s+\w+)/g)
    if (capitalizedMatches && capitalizedMatches.length >= 2) {
      parts = capitalizedMatches.slice(0, 2)
    }
  }

  if (parts.length >= 2 && scores.length >= 2) {
    return {
      homeTeam: cleanTeamName(parts[0]),
      awayTeam: cleanTeamName(parts[1]),
      status: status === 'END' ? 'ENDED' : status,
      scores,
      period,
      timeRemaining
    }
  }

  return null
}

function cleanTeamName(name: string): string {
  return name
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[|/]+/g, '')
    .replace(/\u200C|\u200B/g, '') // Remove zero-width characters
    .trim()
}

// Extract quarter scores from the score array
// Scores come in various formats depending on the game state
// For live games, may only have partial quarter data (Q1, Q2, etc.)
// Note: Source data may not always have quarters that sum to totals (common in live data)
function extractQuarterScores(
  scores: number[],
  homeTotal: number,
  awayTotal: number
): { home: number[]; away: number[] } {
  // Valid quarter scores are typically 5-50 for basketball (lowered min for early game)
  const validScores = scores.filter((s) => s >= 5 && s <= 50)

  // Handle empty or insufficient data
  if (validScores.length < 2) {
    return { home: [], away: [] }
  }

  // For full game data (8+ quarter scores)
  if (validScores.length >= 8) {
    const first8 = validScores.slice(0, 8)

    // Calculate different format options
    const formats = [
      // Sequential: home first 4, away next 4
      { home: first8.slice(0, 4), away: first8.slice(4, 8) },
      // Interleaved: h1,a1,h2,a2,h3,a3,h4,a4
      {
        home: [first8[0], first8[2], first8[4], first8[6]],
        away: [first8[1], first8[3], first8[5], first8[7]]
      },
      // Swapped interleaved: a1,h1,a2,h2,a3,a4,h4,a4
      {
        home: [first8[1], first8[3], first8[5], first8[7]],
        away: [first8[0], first8[2], first8[4], first8[6]]
      }
    ]

    // Find the format where sums are closest to totals
    let bestFormat: { home: number[]; away: number[] } | null = null
    let bestDiff = Infinity

    for (const format of formats) {
      const homeFiltered = format.home.filter((n): n is number => n !== undefined)
      const awayFiltered = format.away.filter((n): n is number => n !== undefined)

      if (homeFiltered.length !== 4 || awayFiltered.length !== 4) continue

      const homeSum = homeFiltered.reduce((a, b) => a + b, 0)
      const awaySum = awayFiltered.reduce((a, b) => a + b, 0)
      const diff = Math.abs(homeSum - homeTotal) + Math.abs(awaySum - awayTotal)

      if (diff < bestDiff) {
        bestDiff = diff
        bestFormat = { home: homeFiltered, away: awayFiltered }
      }
    }

    if (bestFormat) {
      // Calculate Q4 for away team from total (source data often has corrupted Q4)
      const awayQ1to3Sum = bestFormat.away.slice(0, 3).reduce((a, b) => a + b, 0)
      const calculatedAwayQ4 = awayTotal - awayQ1to3Sum

      return {
        home: bestFormat.home,
        away: [...bestFormat.away.slice(0, 3), calculatedAwayQ4]
      }
    }
  }

  // For partial game data (2-7 quarter scores) - live games in Q1, Q2, Q3
  // Try to extract what quarters are available
  const quarterCount = Math.floor(validScores.length / 2)

  if (quarterCount >= 1) {
    // Try different formats for partial data
    const partialFormats = [
      // Sequential: home quarters first, then away quarters
      {
        home: validScores.slice(0, quarterCount),
        away: validScores.slice(quarterCount, quarterCount * 2)
      },
      // Interleaved: h1,a1,h2,a2,...
      {
        home: validScores.filter((_, i) => i % 2 === 0).slice(0, quarterCount),
        away: validScores.filter((_, i) => i % 2 === 1).slice(0, quarterCount)
      }
    ]

    // Find format where sums are closest to totals
    let bestPartialFormat: { home: number[]; away: number[] } | null = null
    let bestPartialDiff = Infinity

    for (const format of partialFormats) {
      const homeFiltered = format.home.filter((n): n is number => n !== undefined)
      const awayFiltered = format.away.filter((n): n is number => n !== undefined)

      if (homeFiltered.length === 0 || awayFiltered.length === 0) continue

      const homeSum = homeFiltered.reduce((a, b) => a + b, 0)
      const awaySum = awayFiltered.reduce((a, b) => a + b, 0)

      // For partial data, we expect sums to be close to or equal to totals
      // (since we might only have completed quarters)
      const diff = Math.abs(homeSum - homeTotal) + Math.abs(awaySum - awayTotal)

      if (diff < bestPartialDiff) {
        bestPartialDiff = diff
        bestPartialFormat = { home: homeFiltered, away: awayFiltered }
      }
    }

    if (bestPartialFormat) {
      return bestPartialFormat
    }
  }

  return { home: [], away: [] }
}

export function parseMatchesFromHtml(html: string): MatchScore[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const matches: MatchScore[] = []

  // Method 1: Find buttons with match data (most reliable for this site)
  // Pattern: "Pin match END S.M. Beermen Barangay Ginebra ‌ 93 ‌ 84..."
  const matchButtons = doc.querySelectorAll('button[name*="Pin match"], [role="button"]')

  for (const btn of matchButtons) {
    const text = btn.textContent ?? ''
    if (!text.includes('Pin match') || text.length < 20) continue

    const parsed = parseMatchText(text)
    if (parsed && parsed.scores.length >= 2) {
      const homeScore = parsed.scores[0]
      const awayScore = parsed.scores[1]
      if (homeScore !== undefined && awayScore !== undefined) {
        // Try to extract quarter scores from remaining scores
        // Format in text: [total1, total2, homeQ1, homeQ2, homeQ3, homeQ4, awayQ1, awayQ2, awayQ3, awayQ4]
        const quarterScores = extractQuarterScores(parsed.scores.slice(2), homeScore, awayScore)

        const validScores = parsed.scores.slice(2).filter((s) => s >= 10 && s <= 45)
        matches.push({
          homeTeam: parsed.homeTeam || 'Home',
          awayTeam: parsed.awayTeam || 'Away',
          homeScore,
          awayScore,
          status: parsed.status,
          quarterScores,
          period: parsed.period,
          timeRemaining: parsed.timeRemaining,
          _debug: {
            rawScores: parsed.scores,
            validScores
          }
        })
      }
    }
  }

  // Method 2: Fallback to score containers with data-testid
  if (matches.length === 0) {
    const scoreContainers = doc.querySelectorAll('[data-testid="matchList-common-match__results"]')

    for (const container of scoreContainers) {
      const scoreElements = container.querySelectorAll('.rounded-match__score')
      const scores: number[] = []

      for (const el of scoreElements) {
        const text = el.textContent?.trim() ?? ''
        const num = parseInt(text, 10)
        if (!isNaN(num)) {
          scores.push(num)
        }
      }

      if (scores.length >= 2) {
        const homeScore = scores[0]
        const awayScore = scores[1]
        if (homeScore !== undefined && awayScore !== undefined) {
          matches.push({
            homeTeam: 'Unknown',
            awayTeam: 'Unknown',
            homeScore,
            awayScore,
            status: 'LIVE',
            quarterScores: {
              home: scores.length > 2 ? scores.slice(2, 6) : [],
              away: scores.length > 6 ? scores.slice(6, 10) : []
            }
          })
        }
      }
    }
  }

  // Method 3: Last resort - parse any visible scores
  if (matches.length === 0) {
    const allScoreElements = doc.querySelectorAll('.rounded-match__score, [class*="score"]')
    const scores: number[] = []

    for (const el of allScoreElements) {
      const text = el.textContent?.trim() ?? ''
      const num = parseInt(text, 10)
      if (!isNaN(num) && num >= 0 && num <= 200) {
        scores.push(num)
      }
    }

    for (let i = 0; i < scores.length - 1; i += 2) {
      const homeScore = scores[i]
      const awayScore = scores[i + 1]
      if (homeScore !== undefined && awayScore !== undefined) {
        matches.push({
          homeTeam: `Team ${Math.floor(i / 2) + 1}A`,
          awayTeam: `Team ${Math.floor(i / 2) + 1}B`,
          homeScore,
          awayScore,
          status: 'LIVE',
          quarterScores: { home: [], away: [] }
        })
      }
    }
  }

  return matches
}

// Simple extraction of all scores from HTML
export function extractAllScores(html: string): number[] {
  const window = new Window()
  const doc = window.document
  doc.body.innerHTML = html

  const scores: number[] = []
  const scoreElements = doc.querySelectorAll('.rounded-match__score, [class*="score"]')

  for (const el of scoreElements) {
    const text = el.textContent?.trim() ?? ''
    const num = parseInt(text, 10)
    if (!isNaN(num) && num >= 0 && num <= 200) {
      scores.push(num)
    }
  }

  return scores
}

// Original function fixed for backwards compatibility
export function findElementByAttribute(html: string, attribute: string, value: string): string | null {
  const window = new Window()
  const doc = window.document
  doc.body.innerHTML = html

  const element = doc.querySelector(`[${attribute}="${value}"]`)
  return element ? element.outerHTML : null
}

// Fixed extractScores function
export function extractScores(html: string): number[] {
  const window = new Window()
  const doc = window.document
  doc.body.innerHTML = html

  const scoreElements = doc.querySelectorAll('.rounded-match__score')
  const scores: number[] = []

  for (const element of scoreElements) {
    const text = element.textContent?.trim() ?? ''
    const num = parseInt(text, 10)
    if (!isNaN(num)) {
      scores.push(num)
    }
  }

  return scores
}
