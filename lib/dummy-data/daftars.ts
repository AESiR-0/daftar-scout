interface FounderProfileProps {
    name: string
    age: string
    designation: string
    email: string
    phone: string
    gender: string
    location: string
    language: string[]
    imageUrl?: string
    createdAt: string
}

export interface Pitch {
    id: string
    name: string 
    status: 'Accepted' | "Ice box" | "Invitation Sent" | "Deal Cancelled" | "Deleted by Founder" | "Planning" | "Pitched"
    date: string
    scoutName: string
    organizers: string[]
    pitchName: string
    postedBy: string
    daftar: string
}

export interface Daftar {
    id: string
    name: string
    pitchCount: number
    team: {
        owner: string
        members: Array<FounderProfileProps>
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
                { name: "Sarah Smith", email: "sarah@example.com", age: "25", phone: "1234567890", gender: "Female", location: "New York", language: ["English", "Spanish"], designation: "CEO", createdAt: "2024-01-01" },
                { name: "Mike Johnson", email: "mike@example.com", age: "30", phone: "1234567890", gender: "Male", location: "Los Angeles", language: ["English", "French"], designation: "CTO", createdAt: "2024-01-01" }
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
                organizers: ["John Doe", "Sarah Smith"],
                pitchName: "Healthcare AI Revolution",
                postedBy: "John Doe",
                daftar: "Tech Innovation Fund"
            },
            {
                id: "scout-2",
                name: "E-commerce Platform",
                status: "Pitched",
                date: "2024-03-20",
                scoutName: "MENA Growth Capital",
                organizers: ["Hassan Ahmed", "Fatima Al-Sayed"],
                pitchName: "NextGen E-commerce",
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
                { name: "Alex Wong", email: "alex@example.com", age: "28", phone: "1234567890", gender: "Male", location: "San Francisco", language: ["English", "Chinese"], designation: "CEO", createdAt: "2024-01-01" },
                { name: "Lisa Chen", email: "lisa@example.com", age: "32", phone: "1234567890", gender: "Female", location: "New York", language: ["English", "French"], designation: "COO", createdAt: "2024-01-01" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-05-01",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-3", name: "Islamic Banking Platform", status: "Invitation Sent", date: "2024-03-10", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Islamic Banking Platform" },
            { id: "scout-4", name: "Crypto Trading Bot", status: "Deleted by Founder", date: "2024-03-25", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Crypto Trading Bot" }
        ]
    },
    {
        id: "scout-women-tech",
        name: "Women in Tech Fund",
        pitchCount: 175,
        team: {
            owner: "Maria Garcia",
            members: [
                { name: "Emma Wilson", email: "emma@example.com", age: "27", phone: "1234567890", gender: "Female", location: "London", language: ["English", "Spanish"], designation: "CEO", createdAt: "2024-01-01" },
                { name: "Sophie Lee", email: "sophie@example.com", age: "31", phone: "1234567890", gender: "Female", location: "New York", language: ["English", "French"], designation: "CTO", createdAt: "2024-01-01" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-04-30",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-5", name: "EdTech Platform", status: "Accepted", date: "2024-03-18", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "EdTech Platform" },
            { id: "scout-6", name: "Health Tech App", status: "Invitation Sent", date: "2024-03-22", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Health Tech App" }
        ]
    },
    {
        id: "scout-impact-ventures",
        name: "Social Impact Ventures",
        pitchCount: 120,
        team: {
            owner: "David Kim",
            members: [
                { name: "Rachel Green", email: "rachel@example.com", age: "29", phone: "1234567890", gender: "Female", location: "London", language: ["English", "Spanish"], designation: "COO", createdAt: "2024-01-01" },
                { name: "Tom Brown", email: "tom@example.com", age: "33", phone: "1234567890", gender: "Male", location: "New York", language: ["English", "French"], designation: "Founder", createdAt: "2024-01-01" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-06-15",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-7", name: "Sustainable Agriculture Tech", status: "Invitation Sent", date: "2024-03-28", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Sustainable Agriculture Tech" },
            { id: "scout-8", name: "Clean Energy Solution", status: "Deal Cancelled", date: "2024-03-15", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Clean Energy Solution" }
        ]
    },
    {
        id: "scout-mena-growth",
        name: "MENA Growth Capital",
        pitchCount: 300,
        team: {
            owner: "Hassan Ahmed",
            members: [
                { name: "Fatima Al-Sayed", email: "fatima@example.com", age: "35", phone: "1234567890", gender: "Female", location: "Dubai", language: ["English", "Arabic"], designation: "Co-Founder", createdAt: "2024-01-01" },
                { name: "Omar Khan", email: "omar@example.com", age: "30", phone: "1234567890", gender: "Male", location: "Cairo", language: ["English", "Arabic"], designation: "Co-Founder", createdAt: "2024-01-01" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Active",
            nextBilling: "2024-05-15",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-9", name: "E-commerce Platform", status: "Accepted", date: "2024-03-20", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "E-commerce Platform" },
            { id: "scout-10", name: "Last-Mile Logistics", status: "Deleted by Founder", date: "2024-03-25", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Last-Mile Logistics" }
        ]
    },
    {
        id: "scout-halal-innovations",
        name: "Halal Tech Innovations",
        pitchCount: 85,
        team: {
            owner: "Ahmad Ibrahim",
            members: [
                { name: "Zainab Hassan", email: "zainab@example.com", age: "35", phone: "1234567890", gender: "Female", location: "Dubai", language: ["English", "Arabic"], designation: "CTO", createdAt: "2024-01-01" },
                { name: "Yusuf Ali", email: "yusuf@example.com", age: "30", phone: "1234567890", gender: "Male", location: "Cairo", language: ["English", "Arabic"], designation: "Co-Founder", createdAt: "2024-01-01" }
            ]
        },
        subscription: {
            plan: "Pro Scout",
            status: "Inactive",
            nextBilling: "2024-07-01",
            features: scoutingFeatures
        },
        pitches: [
            { id: "scout-11", name: "Halal Food Delivery", status: "Invitation Sent", date: "2024-03-12", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Halal Food Delivery" },
            { id: "scout-12", name: "Islamic Fintech App", status: "Deleted by Founder", date: "2024-03-28", scoutName: "Tech Innovation Fund", postedBy: "John Doe", daftar: "Tech Innovation Fund", organizers: ["John Doe", "Sarah Smith"], pitchName: "Islamic Fintech App" }
        ]
    }
] 