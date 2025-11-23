export enum MessageSender {
    USER = 'user',
    AI = 'ai'
}

export interface ChatMessage {
    sender: MessageSender;
    text: string;
    isLoading?: boolean;
}

export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    PROCESSING = 'processing',
    SUCCESS = 'success',
    ERROR = 'error'
}

export interface FileMetadata {
    name: string;
    size?: number;
    type?: string;
    path?: string;
    id?: string;
    storagePath?: string;
    downloadUrl?: string;
    createdAt?: number;
}

export interface FileUploadState {
    file: File;
    status: UploadStatus;
    metadata: FileMetadata;
    error?: string;
}
