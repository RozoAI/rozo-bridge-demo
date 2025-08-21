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
  // Handle preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source',
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

    console.log(`[CORS Proxy] ${method} ${url}`)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Forward authorization headers if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers.authorization = authHeader
    }

    // Forward other relevant headers
    const trpcSource = request.headers.get('x-trpc-source')
    if (trpcSource) {
      headers['x-trpc-source'] = trpcSource
    }

    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text()
      } catch (e) {
        // No body
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    const responseText = await response.text()
    let responseData: any

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = responseText
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source',
      },
    })
  } catch (error) {
    console.error('[CORS Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trpc-source',
        },
      }
    )
  }
}
