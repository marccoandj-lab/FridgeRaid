declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, SVGProps } from 'react'

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: {
      scale?: number
      center?: [number, number]
    }
    style?: React.CSSProperties
    className?: string
    children?: ReactNode
  }

  interface ZoomableGroupProps {
    zoom?: number
    minZoom?: number
    maxZoom?: number
    center?: [number, number]
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string
    children: (context: {
      geographies: GeographyType[]
    }) => ReactNode
  }

  interface GeographyType {
    rsmKey: string
    properties: {
      name?: string
      continent?: string
      iso_a3?: string
      iso_a2?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }

  interface GeographyProps {
    geography: GeographyType
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    style?: Record<string, Record<string, string | number | undefined>>
  }

  interface MarkerProps {
    coordinates: [number, number]
    children?: ReactNode
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
  export const Marker: ComponentType<MarkerProps>
}
