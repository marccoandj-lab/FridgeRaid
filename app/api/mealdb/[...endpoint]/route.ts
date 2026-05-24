import { NextRequest, NextResponse } from 'next/server'

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ endpoint: string[] }> }
) {
  const { endpoint } = await params
  const path = endpoint.join('/')
  const url = `${MEALDB_BASE}/${path}`

  const res = await fetch(url, { next: { revalidate: 86400 } })
  const data = await res.json()

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
