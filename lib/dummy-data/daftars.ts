export interface Pitch {
    id: string
    name: string
    status: 'Accepted' | 'Pending' | 'Rejected' | 'Pitched' | 'Scout Interested' | 'Not Matched' | 'Planning'
    date: string
    scoutName: string
    postedBy: string
    daftar: string
}

export interface Daftar {
    id: string
    name: string
    pitchCount: number
    team: {
        owner: string
        members: Array<{
            name: string
            role: string
            email: string
        }>
    }
    subscription: {
        plan: string
        status: 'Active' | 'Inactive'
        nextBilling: string
        features: string[]
    }
    pitches: Pitch[]
    pendingInvites?: Array<{
        email: string
        designation: string
        sentAt: string
    }>
}

const scoutingFeatures = [
    "Unlimited pitches",
    "Scout network access",
    "Community support",
    "Advanced matching",
    "Priority support"
]

export const daftarsData: Daftar[] = [
    {
        id: "tech-innovation",
        name: "Tech Innovation Fund",
        pitchCount: 200,
        team: {
            owner: "John Doe",
            members: [
                { name: "Sarah Smith", role: "Lead Analyst", email: "sarah@example.com" },
                { name: "Mike Johnson", role: "Investment Manager", email: "mike@example.com" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-05-01",
            features: scoutingFeatures
        },
        pitches: [
            {
                id: "scout-1",
                name: "AI Healthcare Solution",
                status: "Planning",
                date: "2024-03-20",
                scoutName: "Tech Innovation Fund",
                postedBy: "John Doe",
                daftar: "Tech Innovation Fund"
            },
            {
                id: "scout-2",
                name: "E-commerce Platform",
                status: "Accepted",
                date: "2024-03-20",
                scoutName: "MENA Growth Capital",
                postedBy: "Hassan Ahmed",
                daftar: "MENA Growth Capital"
            }
        ],
        pendingInvites: [
            { email: "newmember@example.com", designation: "New Analyst", sentAt: "2024-03-15" }
        ]
    },
    {
        id: "scout-fintech-hub",
        name: "FinTech Innovation Hub",
        pitchCount: 150,
        team: {
            owner: "Jane Smith",
            members: [
                { name: "Alex Wong", role: "Financial Analyst", email: "alex@example.com" },
                { name: "Lisa Chen", role: "Investment Director", email: "lisa@example.com" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-05-01",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-3", name: "Islamic Banking Platform", status: "Accepted", date: "2024-03-10", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" },
            { id: "scout-4", name: "Crypto Trading Bot", status: "Pending", date: "2024-03-25", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" }
        ]
    },
    {
        id: "scout-women-tech",
        name: "Women in Tech Fund",
        pitchCount: 175,
        team: {
            owner: "Maria Garcia",
            members: [
                { name: "Emma Wilson", role: "Program Director", email: "emma@example.com" },
                { name: "Sophie Lee", role: "Investment Analyst", email: "sophie@example.com" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-04-30",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-5", name: "EdTech Platform", status: "Accepted", date: "2024-03-18", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" },
            { id: "scout-6", name: "Health Tech App", status: "Rejected", date: "2024-03-22", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" }
        ]
    },
    {
        id: "scout-impact-ventures",
        name: "Social Impact Ventures",
        pitchCount: 120,
        team: {
            owner: "David Kim",
            members: [
                { name: "Rachel Green", role: "Impact Assessment Lead", email: "rachel@example.com" },
                { name: "Tom Brown", role: "Portfolio Manager", email: "tom@example.com" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-06-15",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-7", name: "Sustainable Agriculture Tech", status: "Pending", date: "2024-03-28", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" },
            { id: "scout-8", name: "Clean Energy Solution", status: "Accepted", date: "2024-03-15", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" }
        ]
    },
    {
        id: "scout-mena-growth",
        name: "MENA Growth Capital",
        pitchCount: 300,
        team: {
            owner: "Hassan Ahmed",
            members: [
                { name: "Fatima Al-Sayed", role: "Regional Director", email: "fatima@example.com" },
                { name: "Omar Khan", role: "Investment Manager", email: "omar@example.com" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-05-15",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-9", name: "E-commerce Platform", status: "Accepted", date: "2024-03-20", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" },
            { id: "scout-10", name: "Last-Mile Logistics", status: "Pending", date: "2024-03-25", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" }
        ]
    },
    {
        id: "scout-halal-innovations",
        name: "Halal Tech Innovations",
        pitchCount: 85,
        team: {
            owner: "Ahmad Ibrahim",
            members: [
                { name: "Zainab Hassan", role: "Shariah Compliance", email: "zainab@example.com" },
                { name: "Yusuf Ali", role: "Tech Analyst", email: "yusuf@example.com" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Inactive",
            nextBilling: "2024-07-01",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-11", name: "Halal Food Delivery", status: "Rejected", date: "2024-03-12", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" },
            { id: "scout-12", name: "Islamic Fintech App", status: "Pending", date: "2024-03-28", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund" }
        ]
    }
] 