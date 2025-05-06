import { Scout } from "@/types/scout";

export function isScoutInPlanning(scout: Scout): boolean {
  return scout.status === "Planning" || scout.status === "planning";
}

export function isPastLastDayToPitch(scout: Scout): boolean {
  if (!scout.lastDayToPitch) return false;
  const lastDay = new Date(scout.lastDayToPitch);
  const today = new Date();
  return today > lastDay;
}

export function canEditScout(scout: Scout): boolean {
  // Can edit if:
  // 1. Scout is in planning, OR
  // 2. It's not past the last day to pitch
  return isScoutInPlanning(scout);
} 