export interface Scout {
  scoutId: string;
  daftarId: string;
  scoutName: string;
  scoutDetails?: string;
  scoutVision?: string;
  status: string;
  lastDayToPitch?: Date;
  isLocked: boolean;
} 