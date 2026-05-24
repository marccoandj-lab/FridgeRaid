'use client'

import { type CSSProperties } from 'react'
import {
  ComposableMap, Geographies, Geography, ZoomableGroup, Marker,
} from 'react-simple-maps'
import { CONTINENT_AREAS } from '@/lib/mealdb'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const CONTINENTS = Object.keys(CONTINENT_AREAS) as (keyof typeof CONTINENT_AREAS)[]

const CONTINENT_META: Record<string, { color: string; hoverColor: string; labelColor: string; coords: [number, number]; emblem: string }> = {
  Africa: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.72 0.16 65 / 0.5)', labelColor: 'oklch(0.72 0.16 65)', coords: [20, 5], emblem: '🌍' },
  Asia: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.65 0.12 45 / 0.5)', labelColor: 'oklch(0.65 0.12 45)', coords: [90, 35], emblem: '🌏' },
  Europe: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.7 0.1 200 / 0.5)', labelColor: 'oklch(0.7 0.1 200)', coords: [20, 55], emblem: '🌍' },
  'North America': { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.68 0.14 30 / 0.5)', labelColor: 'oklch(0.68 0.14 30)', coords: [-100, 40], emblem: '🌎' },
  'South America': { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.62 0.13 150 / 0.5)', labelColor: 'oklch(0.62 0.13 150)', coords: [-60, -15], emblem: '🌎' },
  Oceania: { color: 'oklch(0.92 0.01 60 / 0.6)', hoverColor: 'oklch(0.65 0.1 280 / 0.5)', labelColor: 'oklch(0.65 0.1 280)', coords: [135, -25], emblem: '🌏' },
}

interface WorldMapProps {
  hoveredContinent: string | null
  setHoveredContinent: (c: string | null) => void
  onContinentClick: (continent: string) => void
}

export function WorldMap({ hoveredContinent, setHoveredContinent, onContinentClick }: WorldMapProps) {
  return (
    <div className="relative" style={{ height: '55vh', minHeight: '340px' }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-background via-background/70 to-transparent pb-16 pt-4">
        <div className="pointer-events-auto mx-auto max-w-7xl px-4">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Explore by Continent
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Click a country or card to discover its cuisine
          </p>
        </div>
      </div>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [15, 30] }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as CSSProperties}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo, i) => {
                const continent = geo.properties?.continent
                const isHovered = hoveredContinent === continent
                const meta = continent ? CONTINENT_META[continent] : null
                return (
                  <Geography
                    key={`${geo.rsmKey}-${i}`}
                    geography={geo}
                    onClick={() => {
                      if (continent && CONTINENT_AREAS[continent]) {
                        onContinentClick(continent)
                      }
                    }}
                    onMouseEnter={() => {
                      if (continent) setHoveredContinent(continent)
                    }}
                    onMouseLeave={() => setHoveredContinent(null)}
                    style={{
                      default: {
                        fill: isHovered && meta ? meta.hoverColor : meta ? 'oklch(0.28 0.02 60)' : 'oklch(0.20 0.01 60)',
                        stroke: isHovered && meta ? meta.labelColor : 'oklch(1 0 0 / 0.12)',
                        strokeWidth: isHovered ? 1.2 : 0.5,
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      },
                      hover: {
                        fill: meta ? meta.hoverColor : 'oklch(0.72 0.16 65 / 0.5)',
                        stroke: meta ? meta.labelColor : 'oklch(0.72 0.16 65 / 0.6)',
                        strokeWidth: 1.5,
                        outline: 'none',
                        cursor: continent && CONTINENT_AREAS[continent] ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: meta ? meta.hoverColor : 'oklch(0.72 0.16 65 / 0.4)',
                        outline: 'none',
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {CONTINENTS.map((name) => {
            const meta = CONTINENT_META[name]
            if (!meta) return null
            const isHovered = hoveredContinent === name
            return (
              <Marker key={name} coordinates={meta.coords}>
                <text
                  textAnchor="middle"
                  fontSize={isHovered ? 15 : 12}
                  fontWeight={700}
                  fontFamily="var(--font-heading)"
                  fill={isHovered ? meta.labelColor : 'oklch(0.92 0.01 60 / 0.5)'}
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onClick={() => onContinentClick(name)}
                >
                  {name}
                </text>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
