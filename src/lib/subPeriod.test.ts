import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { currentWeekWindowUtc, currentMonthWindowUtc, first30dWindowUtc, iso } from './subPeriod'

describe('subPeriod date window helpers', () => {
  let mockDate: Date
  
  beforeEach(() => {
    // Clear any existing date mocks
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('iso helper function', () => {
    it('should format date to ISO string without milliseconds', () => {
      const date = new Date('2023-10-15T14:30:45.123Z')
      const result = iso(date)
      expect(result).toBe('2023-10-15T14:30:45.000Z')
    })

    it('should handle dates with zero milliseconds', () => {
      const date = new Date('2023-10-15T14:30:45.000Z')
      const result = iso(date)
      expect(result).toBe('2023-10-15T14:30:45.000Z')
    })
  })

  describe('currentWeekWindowUtc', () => {
    it('should return Monday to Monday window when called on a Monday', () => {
      // Monday, October 16, 2023 at 10:00 AM UTC
      mockDate = new Date('2023-10-16T10:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentWeekWindowUtc()
      
      expect(result.start).toBe('2023-10-16T00:00:00.000Z') // Same Monday 00:00
      expect(result.end).toBe('2023-10-23T00:00:00.000Z')   // Next Monday 00:00
    })

    it('should return Monday to Monday window when called on a Tuesday', () => {
      // Tuesday, October 17, 2023 at 15:30 UTC
      mockDate = new Date('2023-10-17T15:30:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentWeekWindowUtc()
      
      expect(result.start).toBe('2023-10-16T00:00:00.000Z') // Previous Monday 00:00
      expect(result.end).toBe('2023-10-23T00:00:00.000Z')   // Next Monday 00:00
    })

    it('should return Monday to Monday window when called on a Sunday', () => {
      // Sunday, October 22, 2023 at 23:59 UTC
      mockDate = new Date('2023-10-22T23:59:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentWeekWindowUtc()
      
      expect(result.start).toBe('2023-10-16T00:00:00.000Z') // Previous Monday 00:00
      expect(result.end).toBe('2023-10-23T00:00:00.000Z')   // Next Monday 00:00
    })

    it('should handle year boundary correctly', () => {
      // Sunday, December 31, 2023 (week starts Monday Dec 25)
      mockDate = new Date('2023-12-31T12:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentWeekWindowUtc()
      
      expect(result.start).toBe('2023-12-25T00:00:00.000Z') // Monday Dec 25, 2023
      expect(result.end).toBe('2024-01-01T00:00:00.000Z')   // Monday Jan 1, 2024
    })

    it('should handle Monday at year boundary', () => {
      // Monday, January 1, 2024
      mockDate = new Date('2024-01-01T00:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentWeekWindowUtc()
      
      expect(result.start).toBe('2024-01-01T00:00:00.000Z') // Same Monday
      expect(result.end).toBe('2024-01-08T00:00:00.000Z')   // Next Monday
    })

    it('should handle leap year February correctly', () => {
      // Wednesday, February 28, 2024 (leap year)
      mockDate = new Date('2024-02-28T12:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentWeekWindowUtc()
      
      expect(result.start).toBe('2024-02-26T00:00:00.000Z') // Monday Feb 26
      expect(result.end).toBe('2024-03-04T00:00:00.000Z')   // Monday Mar 4
    })

    it('should use provided date parameter instead of current time', () => {
      // Test with explicit date parameter
      const testDate = new Date('2023-10-18T14:30:00.000Z') // Wednesday
      
      const result = currentWeekWindowUtc(testDate)
      
      expect(result.start).toBe('2023-10-16T00:00:00.000Z') // Monday Oct 16
      expect(result.end).toBe('2023-10-23T00:00:00.000Z')   // Monday Oct 23
    })

    it('should handle daylight saving time transitions in UTC (should not affect)', () => {
      // Test during DST transition period (but in UTC, so should be unaffected)
      // Sunday, March 12, 2023 (DST begins in many timezones, but UTC is constant)
      mockDate = new Date('2023-03-12T12:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentWeekWindowUtc()
      
      expect(result.start).toBe('2023-03-06T00:00:00.000Z') // Monday Mar 6
      expect(result.end).toBe('2023-03-13T00:00:00.000Z')   // Monday Mar 13
    })
  })

  describe('currentMonthWindowUtc', () => {
    it('should return first day to first day of next month', () => {
      // October 15, 2023
      mockDate = new Date('2023-10-15T14:30:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2023-10-01T00:00:00.000Z') // Oct 1, 2023
      expect(result.end).toBe('2023-11-01T00:00:00.000Z')   // Nov 1, 2023
    })

    it('should handle month boundary on first day', () => {
      // November 1, 2023 at midnight
      mockDate = new Date('2023-11-01T00:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2023-11-01T00:00:00.000Z') // Nov 1, 2023
      expect(result.end).toBe('2023-12-01T00:00:00.000Z')   // Dec 1, 2023
    })

    it('should handle month boundary on last day', () => {
      // October 31, 2023 at 23:59
      mockDate = new Date('2023-10-31T23:59:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2023-10-01T00:00:00.000Z') // Oct 1, 2023
      expect(result.end).toBe('2023-11-01T00:00:00.000Z')   // Nov 1, 2023
    })

    it('should handle February in leap year', () => {
      // February 29, 2024 (leap year)
      mockDate = new Date('2024-02-29T12:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2024-02-01T00:00:00.000Z') // Feb 1, 2024
      expect(result.end).toBe('2024-03-01T00:00:00.000Z')   // Mar 1, 2024
    })

    it('should handle February in non-leap year', () => {
      // February 28, 2023 (non-leap year)
      mockDate = new Date('2023-02-28T12:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2023-02-01T00:00:00.000Z') // Feb 1, 2023
      expect(result.end).toBe('2023-03-01T00:00:00.000Z')   // Mar 1, 2023
    })

    it('should handle year boundary - December', () => {
      // December 31, 2023
      mockDate = new Date('2023-12-31T23:59:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2023-12-01T00:00:00.000Z') // Dec 1, 2023
      expect(result.end).toBe('2024-01-01T00:00:00.000Z')   // Jan 1, 2024
    })

    it('should handle year boundary - January', () => {
      // January 1, 2024
      mockDate = new Date('2024-01-01T00:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2024-01-01T00:00:00.000Z') // Jan 1, 2024
      expect(result.end).toBe('2024-02-01T00:00:00.000Z')   // Feb 1, 2024
    })

    it('should handle months with 30 days', () => {
      // April 30, 2023 (30-day month)
      mockDate = new Date('2023-04-30T12:00:00.000Z')
      vi.setSystemTime(mockDate)

      const result = currentMonthWindowUtc()
      
      expect(result.start).toBe('2023-04-01T00:00:00.000Z') // Apr 1, 2023
      expect(result.end).toBe('2023-05-01T00:00:00.000Z')   // May 1, 2023
    })

    it('should use provided date parameter instead of current time', () => {
      const testDate = new Date('2023-07-15T10:30:00.000Z')
      
      const result = currentMonthWindowUtc(testDate)
      
      expect(result.start).toBe('2023-07-01T00:00:00.000Z') // Jul 1, 2023
      expect(result.end).toBe('2023-08-01T00:00:00.000Z')   // Aug 1, 2023
    })
  })

  describe('first30dWindowUtc', () => {
    it('should return 30-day window from provided created_at date', () => {
      const createdAt = '2023-10-01T12:00:00.000Z'
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2023-10-01T12:00:00.000Z') // Exact start time
      expect(result.end).toBe('2023-10-31T12:00:00.000Z')   // 30 days later
    })

    it('should handle month boundary crossing', () => {
      const createdAt = '2023-10-15T08:30:00.000Z'
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2023-10-15T08:30:00.000Z') // Oct 15
      expect(result.end).toBe('2023-11-14T08:30:00.000Z')   // Nov 14 (30 days later)
    })

    it('should handle year boundary crossing', () => {
      const createdAt = '2023-12-15T16:45:00.000Z'
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2023-12-15T16:45:00.000Z') // Dec 15, 2023
      expect(result.end).toBe('2024-01-14T16:45:00.000Z')   // Jan 14, 2024
    })

    it('should handle February leap year boundary', () => {
      const createdAt = '2024-02-15T10:00:00.000Z' // Leap year
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2024-02-15T10:00:00.000Z') // Feb 15, 2024
      expect(result.end).toBe('2024-03-16T10:00:00.000Z')   // Mar 16, 2024 (30 days later)
    })

    it('should handle February non-leap year boundary', () => {
      const createdAt = '2023-02-15T10:00:00.000Z' // Non-leap year
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2023-02-15T10:00:00.000Z') // Feb 15, 2023
      expect(result.end).toBe('2023-03-17T10:00:00.000Z')   // Mar 17, 2023 (30 days later)
    })

    it('should use current time when createdAtIso is null', () => {
      // Mock current time
      mockDate = new Date('2023-10-20T14:30:00.000Z')
      vi.setSystemTime(mockDate)
      
      const result = first30dWindowUtc(null)
      
      expect(result.start).toBe('2023-10-20T14:30:00.000Z') // Current time
      expect(result.end).toBe('2023-11-19T14:30:00.000Z')   // 30 days later
    })

    it('should use current time when createdAtIso is undefined', () => {
      // Mock current time
      mockDate = new Date('2023-10-20T14:30:00.000Z')
      vi.setSystemTime(mockDate)
      
      const result = first30dWindowUtc(undefined)
      
      expect(result.start).toBe('2023-10-20T14:30:00.000Z') // Current time
      expect(result.end).toBe('2023-11-19T14:30:00.000Z')   // 30 days later
    })

    it('should use current time when createdAtIso is empty string', () => {
      // Mock current time
      mockDate = new Date('2023-10-20T14:30:00.000Z')
      vi.setSystemTime(mockDate)
      
      const result = first30dWindowUtc('')
      
      expect(result.start).toBe('2023-10-20T14:30:00.000Z') // Current time
      expect(result.end).toBe('2023-11-19T14:30:00.000Z')   // 30 days later
    })

    it('should preserve exact time including seconds and milliseconds', () => {
      const createdAt = '2023-10-01T12:34:56.789Z'
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2023-10-01T12:34:56.000Z') // Milliseconds zeroed by iso()
      expect(result.end).toBe('2023-10-31T12:34:56.000Z')   // Same time, 30 days later
    })

    it('should handle edge case of adding 30 days to end of month', () => {
      // January 31 + 30 days should be March 2 (not March 3)
      const createdAt = '2023-01-31T12:00:00.000Z'
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2023-01-31T12:00:00.000Z') // Jan 31
      expect(result.end).toBe('2023-03-02T12:00:00.000Z')   // Mar 2 (30 days later)
    })

    it('should handle daylight saving time transitions in UTC (should not affect)', () => {
      // Test during DST transition, but UTC should be unaffected
      const createdAt = '2023-03-01T12:00:00.000Z' // Before DST
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2023-03-01T12:00:00.000Z') // Mar 1
      expect(result.end).toBe('2023-03-31T12:00:00.000Z')   // Mar 31 (exactly 30 days)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle invalid date strings gracefully in first30dWindowUtc', () => {
      // Mock current time as fallback
      mockDate = new Date('2023-10-20T14:30:00.000Z')
      vi.setSystemTime(mockDate)
      
      const result = first30dWindowUtc('invalid-date-string')
      
      // Should fall back to current time when date parsing fails
      expect(result.start).toBe('2023-10-20T14:30:00.000Z')
      expect(result.end).toBe('2023-11-19T14:30:00.000Z')
    })

    it('should handle extreme dates without breaking', () => {
      // Test with a date far in the future
      const createdAt = '2099-12-31T23:59:59.999Z'
      
      const result = first30dWindowUtc(createdAt)
      
      expect(result.start).toBe('2099-12-31T23:59:59.000Z')
      expect(result.end).toBe('2100-01-30T23:59:59.000Z')
    })

    it('should maintain UTC consistency across all functions', () => {
      // Test that all functions return UTC times regardless of system timezone
      mockDate = new Date('2023-10-15T12:00:00.000Z')
      vi.setSystemTime(mockDate)

      const weekResult = currentWeekWindowUtc()
      const monthResult = currentMonthWindowUtc()
      const thirtyDayResult = first30dWindowUtc('2023-10-15T12:00:00.000Z')

      // All results should end with 'Z' indicating UTC
      expect(weekResult.start).toMatch(/Z$/)
      expect(weekResult.end).toMatch(/Z$/)
      expect(monthResult.start).toMatch(/Z$/)
      expect(monthResult.end).toMatch(/Z$/)
      expect(thirtyDayResult.start).toMatch(/Z$/)
      expect(thirtyDayResult.end).toMatch(/Z$/)
    })
  })
})