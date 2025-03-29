// lib/timeSlots.ts
export function getTimeSlot(sessionStart: Date): number {
    const utcHours = sessionStart.getUTCHours(); // Get hours in UTC
    const slot = Math.floor(utcHours / 3) + 1; // Divide by 3 hours per slot, adjust to 1-8
    return slot;
  }
  