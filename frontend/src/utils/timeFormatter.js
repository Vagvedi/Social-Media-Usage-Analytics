/**
 * Converts minutes to a human-readable format
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted string like "2 hrs 15 mins" or "45 mins"
 */
export const formatMinutesToHours = (minutes) => {
  if (!minutes || minutes === 0) return '0 mins';
  
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hours === 0) {
    return `${mins} ${mins === 1 ? 'min' : 'mins'}`;
  }
  
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} ${mins === 1 ? 'min' : 'mins'}`;
};
