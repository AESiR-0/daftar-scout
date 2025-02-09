import formatDate from "@/lib/formatDate"

interface Collaborator {
    name: string
    imageUrl?: string
    daftarName: string
    structure: string
    website: string
    location: string
    onDaftarSince: string
    bigPicture: string
}

export interface ScoutDetails {
    slug: string
    title: string
    collaborators: Collaborator[]
    description: string
    videoUrl: string
    about: string
    details: {
        Community: string
        Location: string
        Gender: string
        Age: string
        Stage: string
        Sector: string
    }
    requirements: {
        experience: string
        availability: string
        communication: string
    }
    faqs: Array<{
        question: string
        answer: string
    }>
    updates: Array<{
        date: string
        content: string
    }>
    lastPitchDate: string
    isBookmarked: boolean
    daftarId: string  // Reference to the daftar
}

export const scoutDetailsData: ScoutDetails[] = [
    {
        title: "Tech Talent Scout Program",
        slug: "tech-talent-scout-program",
        collaborators: [
            {
                name: "Daftar OS",
                daftarName: "Daftar Open Source",
                structure: "Technology Company",
                website: "https://daftar.com",
                location: "Dubai, UAE",
                onDaftarSince: "2023-01-15",
                bigPicture: "Building the future of startup ecosystem",
                imageUrl: "/daftar-logo.png"
            },
            {
                name: "Nithin Kamath",
                daftarName: "Nithin Kamath",
                structure: "Angel Investor",
                website: "https://nithinkamath.me",
                location: "Bangalore, India",
                onDaftarSince: "2023-03-20",
                bigPicture: "Democratizing financial markets in India",
                imageUrl: "/nithin-profile.png"
            }
        ],
        description: "Early stage technology companies investment program focused on innovative solutions",
        videoUrl: "https://example.com/video.mp4",
        about: `Our program focuses on early-stage technology startups with innovative solutions. 
               We provide not just funding, but also mentorship and networking opportunities.`,
        details: {
            Community: "Open",
            Location: "UAE",
            Gender: "All",
            Age: "18 to 35 Yrs",
            Stage: "Seed",
            Sector: "Technology",
        },
        requirements: {
            experience: "Minimum 3 years in tech industry",
            availability: "10 hours/week",
            communication: "Fluent in English"
        },
        faqs: [
            {
                question: "What kind of projects do you scout for?",
                answer: "We scout for innovative technology projects and talented teams."
            },
            {
                question: "What is your typical investment size?",
                answer: "Our initial investments range from $50,000 to $500,000."
            },
            {
                question: "What sectors do you focus on?",
                answer: "We primarily focus on Big Data, AI, and Enterprise Software."
            }
        ],
        updates: [
            {
                date: formatDate("2024-03-15"),
                content: "Successfully launched the program with 10 startups"
            },
            {
                date: formatDate("2024-03-01"),
                content: "Opened applications for Q2 2024 cohort"
            }
        ],
        lastPitchDate: formatDate("2024-04-15"),
        isBookmarked: false,
        daftarId: "tech-innovation",
    },
    {
        title: "FinTech Innovation Hub",
        slug: "fintech-innovation-hub",
        collaborators: [
            {
                name: "Islamic Finance Initiative",
                daftarName: "Islamic Finance Initiative",
                structure: "Financial Institution",
                website: "https://islamicfinanceinitiative.com",
                location: "Malaysia",
                onDaftarSince: "2023-02-15",
                bigPicture: "Promoting Islamic finance through technology",
                imageUrl: "/islamic-finance-initiative-logo.png"
            },
            {
                name: "GUSEC",
                daftarName: "Global University of Islamic Finance",
                structure: "Educational Institution",
                website: "https://guse.edu.my",
                location: "Malaysia",
                onDaftarSince: "2023-03-01",
                bigPicture: "Leading Islamic finance education",
                imageUrl: "/guse-logo.png"
            }
        ],
        description: "Supporting innovative financial technology solutions with Islamic finance principles",
        videoUrl: "https://example.com/fintech-video.mp4",
        about: `We are dedicated to fostering innovation in Islamic finance through technology. 
               Our program provides both financial support and Shariah compliance guidance.`,
        details: {
            Community: "Muslim",
            Location: "Malaysia",
            Gender: "All",
            Age: "21 to 45 Yrs",
            Stage: "Pre-seed to Seed",
            Sector: "FinTech",
        },
        requirements: {
            experience: "Minimum 3 years in Islamic finance",
            availability: "10 hours/week",
            communication: "Fluent in Arabic"
        },
        faqs: [
            {
                question: "Do you only invest in Islamic finance solutions?",
                answer: "While we focus on Islamic finance, we consider any fintech solution that can be adapted to Islamic principles."
            },
            {
                question: "What support do you provide besides funding?",
                answer: "We provide Shariah compliance consultation, mentorship, and access to our network of Islamic banks."
            }
        ],
        updates: [
            {
                date: formatDate("2024-03-10"),
                content: "Partnered with 5 major Islamic banks"
            },
            {
                date: formatDate("2024-02-28"),
                content: "Launched Shariah-compliant fintech accelerator program"
            }
        ],
        lastPitchDate: formatDate("2024-05-01"),
        isBookmarked: true,
        daftarId: "tech-innovation",
    },
    {
        title: "Women in Tech Fund",
        slug: "women-in-tech-fund",
        collaborators: [
            {
                name: "Female Founders Alliance",
                daftarName: "Female Founders Alliance",
                structure: "Networking Group",
                website: "https://femalefoundersalliance.com",
                location: "Singapore",
                onDaftarSince: "2023-01-01",
                bigPicture: "Empowering women in tech entrepreneurship",
                imageUrl: "/female-founders-alliance-logo.png"
            },
            {
                name: "IIMA",
                daftarName: "Institute of International Management",
                structure: "Educational Institution",
                website: "https://iima.edu.sg",
                location: "Singapore",
                onDaftarSince: "2023-02-15",
                bigPicture: "Leading management education in Asia",
                imageUrl: "/iima-logo.png"
            }
        ],
        description: "Empowering women-led technology startups across Southeast Asia",
        videoUrl: "https://example.com/wit-video.mp4",
        about: `Our mission is to bridge the gender gap in tech entrepreneurship. 
               We provide funding, mentorship, and a supportive community for women founders.`,
        details: {
            Community: "All",
            Location: "Singapore",
            Gender: "Female",
            Age: "20 to 50 Yrs",
            Stage: "Seed",
            Sector: "Technology",
        },
        requirements: {
            experience: "Minimum 2 years in tech industry",
            availability: "8 hours/week",
            communication: "Fluent in English"
        },
        faqs: [
            {
                question: "Is the program only for women founders?",
                answer: "Yes, the primary founder must be a woman, but we welcome diverse founding teams."
            },
            {
                question: "What is your geographical focus?",
                answer: "We focus on Southeast Asian startups but are open to exceptional candidates from other regions."
            }
        ],
        updates: [
            {
                date: formatDate("2024-03-20"),
                content: "Launched mentorship program with 20 successful women entrepreneurs"
            },
            {
                date: formatDate("2024-03-05"),
                content: "Opened applications for Summer 2024 cohort"
            }
        ],
        lastPitchDate: formatDate("2024-04-30"),
        isBookmarked: false,
        daftarId: "tech-innovation",
    }
]

// Helper function to get scout details by name
export const getScoutDetailsByName = (name: string): ScoutDetails | undefined => {
    return scoutDetailsData.find(scout =>
        scout.slug === name.toLowerCase().split('.').join('-')
    )
} 