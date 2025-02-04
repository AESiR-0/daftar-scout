// Types for analytics data
export interface PitchAnalytics {
  pitchesGiven: number
  pitchesApproved: number
  pitchesRejected: number
  scoutingRequests: number
  requestsRejected: number
  requestsAccepted: number
  requestsWithdrawn: number
}

export interface DaftarPerformance {
  daftarName: string
  metrics: {
    month: string
    pitchesGiven: number
    successRate: number
  }[]
}

// Dummy data for founder analytics
export const founderAnalytics: PitchAnalytics = {
  pitchesGiven: 45,
  pitchesApproved: 28,
  pitchesRejected: 17,
  scoutingRequests: 20,
  requestsRejected: 5,
  requestsAccepted: 12,
  requestsWithdrawn: 3,
}

// Monthly performance data for all daftars
export const daftarPerformanceData: DaftarPerformance[] = [
  {
    daftarName: "Tech Startup A",
    metrics: [
      { month: "Jan", pitchesGiven: 5, successRate: 60 },
      { month: "Feb", pitchesGiven: 8, successRate: 75 },
      { month: "Mar", pitchesGiven: 6, successRate: 50 },
      { month: "Apr", pitchesGiven: 10, successRate: 80 },
      { month: "May", pitchesGiven: 7, successRate: 71 },
      { month: "Jun", pitchesGiven: 9, successRate: 67 },
    ],
  },
  {
    daftarName: "E-commerce B",
    metrics: [
      { month: "Jan", pitchesGiven: 3, successRate: 33 },
      { month: "Feb", pitchesGiven: 6, successRate: 50 },
      { month: "Mar", pitchesGiven: 9, successRate: 67 },
      { month: "Apr", pitchesGiven: 7, successRate: 71 },
      { month: "May", pitchesGiven: 5, successRate: 80 },
      { month: "Jun", pitchesGiven: 8, successRate: 75 },
    ],
  },
  {
    daftarName: "FinTech C",
    metrics: [
      { month: "Jan", pitchesGiven: 7, successRate: 71 },
      { month: "Feb", pitchesGiven: 4, successRate: 50 },
      { month: "Mar", pitchesGiven: 8, successRate: 63 },
      { month: "Apr", pitchesGiven: 6, successRate: 67 },
      { month: "May", pitchesGiven: 9, successRate: 78 },
      { month: "Jun", pitchesGiven: 5, successRate: 60 },
    ],
  },
]

// Scout analytics dummy data
export interface ScoutAnalytics {
  pitchesReviewed: number
  requestsExtended: number
  requestsPending: number
  requestsAccepted: number
  requestsRejected: number
  requestsWithdrawn: number
  totalScoutedProjects: number
  averageResponseTime: number // in days
}

export const scoutAnalytics: ScoutAnalytics = {
  pitchesReviewed: 75,
  requestsExtended: 30,
  requestsPending: 8,
  requestsAccepted: 12,
  requestsRejected: 7,
  requestsWithdrawn: 3,
  totalScoutedProjects: 25,
  averageResponseTime: 3, // 3 days average response time
}

// Monthly scouting trends
export interface ScoutingTrend {
  month: string
  scoutedProjects: number
  successfulMatches: number
}

export const scoutingTrends: ScoutingTrend[] = [
  { month: "Jan", scoutedProjects: 5, successfulMatches: 2 },
  { month: "Feb", scoutedProjects: 7, successfulMatches: 3 },
  { month: "Mar", scoutedProjects: 10, successfulMatches: 4 },
  { month: "Apr", scoutedProjects: 8, successfulMatches: 3 },
  { month: "May", scoutedProjects: 12, successfulMatches: 5 },
  { month: "Jun", scoutedProjects: 9, successfulMatches: 4 },
] 