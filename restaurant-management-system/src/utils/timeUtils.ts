// Nepal Timezone: UTC+5:45
const NEPAL_TIMEZONE_OFFSET = 5.75 * 60 * 60 * 1000; // 5:45 in milliseconds

/**
 * Get current date/time in Nepal timezone
 */
export const getNepaliDateTime = (date: Date = new Date()): Date => {
  const utcDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000
  );
  return new Date(utcDate.getTime() + NEPAL_TIMEZONE_OFFSET);
};

/**
 * Format date to Nepali locale string
 */
export const formatNepaliDateTime = (date: Date = new Date()): string => {
  const nepaliDate = getNepaliDateTime(date);
  return nepaliDate.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

/**
 * Format date only (without time)
 */
export const formatNepaliDate = (date: Date = new Date()): string => {
  const nepaliDate = getNepaliDateTime(date);
  return nepaliDate.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Format time only
 */
export const formatNepaliTime = (date: Date = new Date()): string => {
  const nepaliDate = getNepaliDateTime(date);
  return nepaliDate.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

/**
 * Get Nepal date for database storage (ISO format)
 */
export const getNepaliDateISO = (date: Date = new Date()): string => {
  const nepaliDate = getNepaliDateTime(date);
  return nepaliDate.toISOString();
};
