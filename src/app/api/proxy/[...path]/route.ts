import { NextRequest, NextResponse } from 'next/server'

const INTENT_API_BASE = 'https://intentapiv2.rozo.ai'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE')
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Handle preflight requests for tRPC
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source, trpc-batch-mode',
      'Access-Control-Max-Age': '86400',
    },
  })
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${INTENT_API_BASE}/${path}${searchParams ? `?${searchParams}` : ''}`

    console.log(`[tRPC Proxy] ${method} ${url}`)

    // Preserve original headers for tRPC compatibility
    const headers: Record<string, string> = {}
    
    // Copy important headers from the original request
    const headersToForward = [
      'content-type',
      'authorization',
      'x-trpc-source',
      'trpc-batch-mode',
      'user-agent',
      'accept',
      'accept-encoding',
      'accept-language'
    ]

    headersToForward.forEach(headerName => {
      const headerValue = request.headers.get(headerName)
      if (headerValue) {
        headers[headerName] = headerValue
      }
    })

    // Ensure content-type for JSON requests
    if (!headers['content-type'] && (method === 'POST' || method === 'PUT')) {
      headers['content-type'] = 'application/json'
    }

    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text()
        if (body) {
          console.log(`[tRPC Proxy] Request body:`, body.substring(0, 200) + (body.length > 200 ? '...' : ''))
        }
      } catch (e) {
        console.log(`[tRPC Proxy] No request body`)
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    console.log(`[tRPC Proxy] Response status: ${response.status}`)
    console.log(`[tRPC Proxy] Response headers:`, Object.fromEntries(response.headers.entries()))

    // Get response as text first to handle both JSON and non-JSON responses
    const responseText = await response.text()
    console.log(`[tRPC Proxy] Response body:`, responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''))

    // Determine if response is JSON
    let isJson = false
    let responseData: any = responseText

    try {
      responseData = JSON.parse(responseText)
      isJson = true
    } catch (e) {
      // Not JSON, keep as text
      console.log(`[tRPC Proxy] Response is not JSON`)
    }

    // Prepare response headers
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source, trpc-batch-mode',
    }

    // Forward important response headers
    const responseHeadersToForward = [
      'content-type',
      'cache-control',
      'etag',
      'last-modified'
    ]

    responseHeadersToForward.forEach(headerName => {
      const headerValue = response.headers.get(headerName)
      if (headerValue) {
        responseHeaders[headerName] = headerValue
      }
    })

    // Return appropriate response type
    if (isJson) {
      return NextResponse.json(responseData, {
        status: response.status,
        headers: responseHeaders,
      })
    } else {
      return new NextResponse(responseText, {
        status: response.status,
        headers: responseHeaders,
      })
    }
  } catch (error) {
    console.error('[tRPC Proxy] Error:', error)
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source, trpc-batch-mode',
        },
      }
    )
  }
}
