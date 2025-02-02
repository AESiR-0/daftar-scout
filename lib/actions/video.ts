import { questions } from "../dummy-data/questions";
export const uploadVideo = async (file: File, questionId: number) => {
    const url = URL.createObjectURL(file);
    questions[questionId].videoUrl = url;
    return url;
}
