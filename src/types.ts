export type UnitSystem = 'metric' | 'imperial'

export type TrailerDimensions = {
  length: string
  width: string
  height: string
  maxWeight: string
}

export type FieldErrors = Partial<
  Record<keyof TrailerDimensions, string>
>

export type TrailerField = keyof TrailerDimensions

export type CargoItem = {
  id: string
  name: string
  length: string
  width: string
  height: string
  weight: string
  fragile: boolean
  tiltable: boolean
  stackable: boolean
}

export type CargoFlag = 'fragile' | 'tiltable' | 'stackable'

export type TrailerInterior = {
  length: number
  width: number
  height: number
}

export type PackedBox = {
  item: CargoItem
  x: number
  y: number
  z: number
  length: number
  width: number
  height: number
  fitted: boolean
  color: string
}
