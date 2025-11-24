# Project Overview: Index Files AI

## Purpose

**fileRead AI** is a web application designed to allow users to interact with their local documents using Artificial Intelligence. The primary goal is to enable users to "chat" with a collection of files, asking questions and receiving answers based solely on the content of those documents. This is particularly useful for quickly extracting information from large sets of text files or PDFs without manually searching through them.

## Usage Guide

### 1. Initial Load

- Upon opening the application, previously uploaded files are **automatically loaded** from Firestore.
- Files that were processed in previous sessions appear in the file list immediately.
- This allows you to continue working with your document collection across sessions.

### 2. Select a Folder

- If starting fresh or adding more files, click the **Select Folder** button (red button).
- The system's file dialog opens for directory selection.
- Select a directory containing the files you wish to analyze.
- **Note:** The application supports text-based files and PDFs.

### 3. Review and Manage Files

- Once files are selected or loaded, the application lists all detected files.
- Each file shows its name, size, and current status.
- **Remove Files:** Click the X button on any pending or failed file to remove it from the list.
- **Duplicate Detection:** The system automatically checks if a file already exists in Firestore (by name and size) before uploading.

### 4. Process Files

- Clicking the **Process Files** button initiates the upload and preparation phase.
- **Progress Tracking:** A real-time progress bar shows the upload status for each file (0-100%).
- **Smart Upload:** Files already in Firestore are skipped automatically.
- **Note:** Files are securely uploaded to **Firebase Storage** for persistent access. Metadata (name, size, type, download URL) is stored in **Cloud Firestore** (specifically the `fileReading` collection).

### 5. Chat with Your Files

- After processing is complete, the interface switches to a **Chat View**.
- The user can type questions into the chat input field.
- The application sends the user's question along with the content of the processed files to the AI.
- The AI responds with answers derived _specifically_ from the provided files.

## Core Processes

### File Selection & Ingestion

- The application uses the HTML5 `webkitdirectory` attribute to allow directory selection.
- It recursively identifies files within the selected folder.

### File Processing & Persistence

- **Text Files:** Read as plain text.
- **PDF Files:** Read as Data URLs (Base64 encoded).
- **Firebase Storage:** The actual binary content of the files is uploaded to a secure bucket using `uploadBytesResumable` for progress tracking.
- **Firestore:** A record is created for each file containing:
  - File metadata (name, size, type)
  - Storage path and download URL
  - Creation timestamp
- **Duplicate Prevention:** Before uploading, the system queries Firestore for existing files with matching name and size.
- **Persistent Loading:** On application startup, all previously uploaded files are fetched from Firestore and displayed.
- **Remote File Access:** Files can be queried from their download URLs when the local File object is not available.

### AI Integration

- The project utilizes **Google's Gemini AI** (specifically the `gemini-2.5-flash` model).
- **Context Window:** The content of all selected files is passed to the AI as context for every query. This ensures the AI has the full "knowledge base" available to answer questions.
- **Streaming Responses:** The AI's responses are streamed back to the user in real-time, providing a responsive conversational experience.
