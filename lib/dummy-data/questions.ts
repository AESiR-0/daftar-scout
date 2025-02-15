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
        question: "What is the problem, and why is it so important for you to solve it?",
        videoUrl: ""
    },
    {
        id: 4,
        question: "Who are your customers, and why will they pay for it?",
        videoUrl: "https://example.com/revenue-model-video.mp4"
    },
    {
        id: 5,
        question: "What is the progress so far, and where do you see it in 3 years?",
        videoUrl: ""
    },
    {
        id: 6,
        question: "What are the challenges today and what support do you want?",
        videoUrl: ""
    }
] 