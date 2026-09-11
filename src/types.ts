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
