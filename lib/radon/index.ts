import { parseMatchesFromHtml, type MatchScore } from './extractor'

// const PBA_URL = 'https://statshub.sportradar.com/betika/en/sport/2/tournament/1956'

interface PBAResponse {
  success: boolean
  timestamp: number
  matches: MatchScore[]
  error?: string
}

export async function extractPBAScores(html: string, live: boolean = false): Promise<PBAResponse> {
  const PBA_URL = process.env.PBA_URL as string
  const url = live ? `${PBA_URL}?status=live` : PBA_URL

  try {
    if (!PBA_URL) {
      return {
        success: false,
        timestamp: Date.now(),
        matches: [],
        error: 'PBA_URL environment variable is not set'
      }
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (!response.ok) {
      return {
        success: false,
        timestamp: Date.now(),
        matches: [],
        error: `Failed to fetch: ${response.status} ${response.statusText}`
      }
    }

    // const html = await response.text()
    const matches = parseMatchesFromHtml(html)

    return {
      success: true,
      timestamp: Date.now(),
      matches
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      timestamp: Date.now(),
      matches: [],
      error: message
    }
  }
}
