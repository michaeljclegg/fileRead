import { GoogleGenAI } from "@google/genai";
import { type FileUploadState, UploadStatus } from "../types/types";

// Helper to convert File to a generative part.
const fileToGenerativePart = (file: File) => {
    return new Promise<any>((resolve, reject) => {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result !== 'string') {
                    return reject('Failed to read file as data URL');
                }
                const parts = reader.result.split(',');
                const base64Data = parts[1];

                if (!base64Data) {
                    return reject('Failed to extract base64 data from file');
                }

                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type || 'application/pdf'
                    }
                });
            };
            reader.onerror = (error) => reject(error);
        } else {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                if (typeof reader.result !== 'string') {
                    return reject('Failed to read file as text');
                }
                resolve({
                    text: `\n\n--- START OF FILE ${file.name} ---\n${reader.result}\n--- END OF FILE ${file.name} ---\n`
                });
            };
            reader.onerror = (error) => reject(error);
        }
    });
};

export const queryFileSearchStore = async (
    query: string,
    uploadedFiles: FileUploadState[],
    onChunk: (chunk: string) => void
) => {
    const config = useRuntimeConfig();
    const apiKey = config.public.apiKey;

    if (!apiKey) {
        throw new Error("API_KEY environment variable not found. Please ensure it is set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const filesToProcess = uploadedFiles.filter(f => f.status === UploadStatus.SUCCESS && f.file);
    if (filesToProcess.length === 0) {
        onChunk("It seems there are no processed files to query. Please upload and process files first.");
        return;
    }

    try {
        const fileParts = await Promise.all(
            filesToProcess.map(f => fileToGenerativePart(f.file))
        );

        const promptParts = [
            ...fileParts,
            {
                text: `CONTEXT:
You are a helpful assistant that answers questions based ONLY on the content of the files provided above.
Do not use any external knowledge. If the answer is not found in the files, say "I could not find an answer in the provided documents."

QUESTION:
${query}

ANSWER:
` }
        ];

        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: promptParts }],
        });

        for await (const chunk of stream) {
            if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        onChunk(`\n\nSorry, an error occurred: ${errorMessage}`);
    }
};
