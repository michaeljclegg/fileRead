import { GoogleGenAI } from "@google/genai";
import { type FileUploadState, UploadStatus, type FileMetadata } from "../types/types";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";

// Helper to convert File to a generative part.
const fileToGenerativePart = (file: File) => {
};

export const uploadFileToFirebase = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<FileMetadata> => {
    const { $storage, $db } = useNuxtApp();
    const storage = $storage as any;
    const db = $db as any;

    // 1. Check for duplicates in Firestore
    const filesCollection = collection(db, "fileReading");
    const q = query(
        filesCollection,
        where("name", "==", file.name),
        where("size", "==", file.size)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.log(`File ${file.name} already exists. Skipping upload.`);
        const doc = querySnapshot.docs[0];
        if (doc) {
            const data = doc.data();
            if (onProgress) onProgress(100);
            return {
                name: data.name,
                size: data.size,
                type: data.type,
                storagePath: data.storagePath,
                downloadUrl: data.downloadUrl,
                createdAt: data.createdAt ? (data.createdAt.seconds * 1000) : Date.now(),
                id: doc.id
            } as FileMetadata;
        }
    }

    // 2. Upload to Storage with Progress
    const path = `uploads/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, path);
    console.log(fileRef);

    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise<FileMetadata>((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                reject(error);
            },
            async () => {
                // Upload completed successfully, now we can get the download URL
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

                // 3. Save Metadata to Firestore
                const metadata: FileMetadata = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    storagePath: path,
                    downloadUrl: downloadUrl,
                    createdAt: Date.now()
                };

                const docRef = await addDoc(filesCollection, {
                    ...metadata,
                    createdAt: serverTimestamp()
                });

                resolve({ ...metadata, id: docRef.id });
            }
        );
    });
};

// add this function - start!
export const fetchFilesFromFirestore = async (): Promise<FileUploadState[]> => {
    const { $db } = useNuxtApp();
    const db = $db as any;
    const filesCollection = collection(db, "fileReading");

    // Order by createdAt desc to show newest first
    const q = query(filesCollection, orderBy("createdAt", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const metadata: FileMetadata = {
                name: data.name,
                size: data.size,
                type: data.type,
                storagePath: data.storagePath,
                downloadUrl: data.downloadUrl,
                createdAt: data.createdAt ? (data.createdAt.seconds * 1000) : Date.now(),
                id: doc.id
            };

            return {
                file: undefined, // No local file object
                status: UploadStatus.SUCCESS, // Already uploaded
                metadata: metadata,
                progress: 100
            };
        });
    } catch (error) {
        console.error("Error fetching files from Firestore:", error);
        return [];
    }
};

// add this function - end

export const queryFileSearchStore = async (
    query: string,
    uploadedFiles: FileUploadState[],
    onChunk: (chunk: string) => void
) => {
    const config = useRuntimeConfig();
    const apiKey = config.public.googleApiKey;

    if (!apiKey) {
        throw new Error("Google API Key not found. Please ensure NUXT_PUBLIC_GOOGLE_API_KEY is set in .env");
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