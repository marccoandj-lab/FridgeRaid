import { NextRequest, NextResponse } from 'next/server'

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string[] }> }
) {
  const { endpoint } = await params
  const path = endpoint.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const queryString = searchParams ? `?${searchParams}` : ''
  const url = `${MEALDB_BASE}/${path}${queryString}`
  const isRandom = path.includes('random')

  const fetchOpts: RequestInit & { next?: { revalidate: number } } = isRandom
    ? { cache: 'no-store' }
    : { next: { revalidate: 86400 } }
  const res = await fetch(url, fetchOpts)
  const data = await res.json()

  const headers: Record<string, string> = {}
  if (!isRandom) {
    headers['Cache-Control'] = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
  }

  return NextResponse.json(data, { headers })
}
