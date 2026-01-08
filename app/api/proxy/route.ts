import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Validate URL
    const targetUrl = new URL(url)
    
    // Optional: Whitelist allowed domains for security
    const allowedDomains = [
      'statshub.sportradar.com',
    ]
    
    if (!allowedDomains.some(domain => targetUrl.hostname.includes(domain))) {
      return NextResponse.json(
        { success: false, error: 'Domain not allowed' },
        { status: 403 }
      )
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') ?? ''
    
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json({ success: true, data, url })
    }
    
    // For HTML and other text content
    const content = await response.text()
    return NextResponse.json({ 
      success: true, 
      data: { type: 'html', content },
      url 
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
