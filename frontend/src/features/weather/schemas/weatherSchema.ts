import { z } from 'zod'
import {
  WEATHER_CONSTRAINTS,
  MIN_HISTORICAL_YEAR,
  MAX_DATE_RANGE_DAYS,
} from '@/constants/weather'
import { getDaysDifference, formatDateISO } from '@/utils/formatters'

const minHistoricalDate = `${MIN_HISTORICAL_YEAR}-01-01`
const getToday = () => formatDateISO(new Date())

/**
 * Zod validation schema for weather ingestion form.
 * Enforces geographic bounds and 31-day date constraints.
 */
export const weatherFormSchema = z
  .object({
    latitude: z
      .number({ required_error: 'Latitude is required', invalid_type_error: 'Latitude must be a number' })
      .min(WEATHER_CONSTRAINTS.LATITUDE_MIN, `Latitude must be between ${WEATHER_CONSTRAINTS.LATITUDE_MIN}° and ${WEATHER_CONSTRAINTS.LATITUDE_MAX}°`)
      .max(WEATHER_CONSTRAINTS.LATITUDE_MAX, `Latitude must be between ${WEATHER_CONSTRAINTS.LATITUDE_MIN}° and ${WEATHER_CONSTRAINTS.LATITUDE_MAX}°`),
    longitude: z
      .number({ required_error: 'Longitude is required', invalid_type_error: 'Longitude must be a number' })
      .min(WEATHER_CONSTRAINTS.LONGITUDE_MIN, `Longitude must be between ${WEATHER_CONSTRAINTS.LONGITUDE_MIN}° and ${WEATHER_CONSTRAINTS.LONGITUDE_MAX}°`)
      .max(WEATHER_CONSTRAINTS.LONGITUDE_MAX, `Longitude must be between ${WEATHER_CONSTRAINTS.LONGITUDE_MIN}° and ${WEATHER_CONSTRAINTS.LONGITUDE_MAX}°`),
    startDate: z
      .string({ required_error: 'Start date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .refine((d) => d >= minHistoricalDate, {
        message: `Start date cannot be earlier than ${minHistoricalDate}`,
      })
      .refine((d) => d <= getToday(), {
        message: 'Start date cannot be in the future',
      }),
    endDate: z
      .string({ required_error: 'End date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .refine((d) => d <= getToday(), {
        message: 'End date cannot be in the future',
      }),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      const diff = getDaysDifference(data.startDate, data.endDate)
      return diff <= MAX_DATE_RANGE_DAYS
    },
    {
      message: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`,
      path: ['endDate'],
    }
  )

export type WeatherFormValues = z.infer<typeof weatherFormSchema>
