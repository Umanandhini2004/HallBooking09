import { useCallback } from 'react';

export const formatTime = (timeStr?: string): string => {
  if (!timeStr) return 'N/A';
  
  // Handle AM/PM strings directly (already formatted from backend)
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
  }
  
  // Parse HH:MM or HHMM format from potential raw data
  let hours = parseInt(timeStr.slice(0, 2));
  let minutes = parseInt(timeStr.slice(-2));
  
  // Handle single digit hours like "9:30"
  if (timeStr.length === 4 && timeStr[1] === ':') {
    hours = parseInt(timeStr[0]);
    minutes = parseInt(timeStr.slice(2));
    if (isNaN(hours) || isNaN(minutes)) return timeStr || 'N/A';
  }
  
  if (isNaN(hours) || isNaN(minutes)) return timeStr || 'N/A';
  
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const useFormatTime = () => {
  return useCallback(formatTime, []);
};

