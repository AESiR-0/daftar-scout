// Types for analytics data
export interface PitchAnalytics {
  pitchesGiven: number
  pitchesApproved: number
  pitchesRejected: number
  offersReceived: number
  offersRejected: number
  offersAccepted: number
  offersWithdrawn: number
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
  offersReceived: 20,
  offersRejected: 5,
  offersAccepted: 12,
  offersWithdrawn: 3,
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

// Investor analytics dummy data
export interface InvestorAnalytics {
  pitchesReviewed: number
  offersExtended: number
  offersPending: number
  offersAccepted: number
  offersRejected: number
  offersWithdrawn: number
  totalInvestmentAmount: number
  averageInvestmentSize: number
}

export const investorAnalytics: InvestorAnalytics = {
  pitchesReviewed: 75,
  offersExtended: 30,
  offersPending: 8,
  offersAccepted: 12,
  offersRejected: 7,
  offersWithdrawn: 3,
  totalInvestmentAmount: 5000000, // in dollars
  averageInvestmentSize: 416666, // total investment / offers accepted
}

// Monthly investment trends
export interface InvestmentTrend {
  month: string
  investmentAmount: number
  numberOfDeals: number
}

export const investmentTrends: InvestmentTrend[] = [
  { month: "Jan", investmentAmount: 500000, numberOfDeals: 2 },
  { month: "Feb", investmentAmount: 750000, numberOfDeals: 3 },
  { month: "Mar", investmentAmount: 1000000, numberOfDeals: 4 },
  { month: "Apr", investmentAmount: 800000, numberOfDeals: 3 },
  { month: "May", investmentAmount: 1200000, numberOfDeals: 5 },
  { month: "Jun", investmentAmount: 750000, numberOfDeals: 3 },
] 