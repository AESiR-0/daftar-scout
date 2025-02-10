interface Question {
    id: number
    question: string
    videoUrl: string
}

export let questions: Question[] = [
    {
        id: 1,
        question: "Introduce yourself.",
        videoUrl: ""
    },
    {
        id: 2,
        question: "How did you come up with the idea?",
        videoUrl: "https://example.com/scaling-strategy-video.mp4"
    },
    {
        id: 3,
        question: "What is the problem are you solving, and why is it really important for you to solve it?",
        videoUrl: ""
    },
    {
        id: 4,
        question: "Who are your customers, and why would they pay for it?",
        videoUrl: "https://example.com/revenue-model-video.mp4"
    },
    {
        id: 5,
        question: "How much have you worked on your startup, and where do you see it in 3 years?",
        videoUrl: ""
    },
    {
        id: 6,
        question: "What challenges are you facing, and what support do you need?",
        videoUrl: ""
    }
] 