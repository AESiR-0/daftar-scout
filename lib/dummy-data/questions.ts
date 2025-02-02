interface Question {
    id: number
    question: string
    videoUrl: string
}

export let questions: Question[] = [
    {
        id: 1,
        question: "What inspired you to start this company?",
        videoUrl: ""
    },
    {
        id: 2,
        question: "How do you plan to scale your business?",
        videoUrl: "https://example.com/scaling-strategy-video.mp4"
    },
    {
        id: 3,
        question: "What makes your solution unique in the market?",
        videoUrl: ""
    },
    {
        id: 4,
        question: "Can you explain your revenue model?",
        videoUrl: "https://example.com/revenue-model-video.mp4"
    },
    {
        id: 5,
        question: "What are your key metrics and traction so far?",
        videoUrl: ""
    },
    {
        id: 6,
        question: "How do you plan to use the investment?",
        videoUrl: ""
    }
] 