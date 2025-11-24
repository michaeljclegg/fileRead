# Project Overview: Index Files AI

## Purpose

**fileRead AI** is a web application designed to allow users to interact with their local documents using Artificial Intelligence. The primary goal is to enable users to "chat" with a collection of files, asking questions and receiving answers based solely on the content of those documents. This is particularly useful for quickly extracting information from large sets of text files or PDFs without manually searching through them.

## Usage Guide

### 1. Select a Folder

- Upon opening the application, the user is presented with a "Start by selecting a folder" screen.
- Clicking the **Select Folder** button opens the system's file dialog.
- The user selects a directory containing the files they wish to analyze.
- **Note:** The application supports text-based files and PDFs.

### 2. Review and Process

- Once a folder is selected, the application lists all detected files.
- The user can review the list to ensure the correct files are included.
- Clicking the **Process Files** (or similar action button) initiates the upload and preparation phase.
- **Note:** Files are securely uploaded to **Firebase Storage** for persistent access. Metadata (name, size, type) is stored in **Cloud Firestore** (specifically the `fileReading` collection). This allows the application to retain knowledge of your files across sessions.

### 3. Chat with Your Files

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
- **Firebase Storage:** The actual binary content of the files is uploaded to a secure bucket.
- **Firestore:** A record is created for each file containing its metadata and a reference to its storage location.

### AI Integration

- The project utilizes **Google's Gemini AI** (specifically the `gemini-2.5-flash` model).
- **Context Window:** The content of all selected files is passed to the AI as context for every query. This ensures the AI has the full "knowledge base" available to answer questions.
- **Streaming Responses:** The AI's responses are streamed back to the user in real-time, providing a responsive conversational experience.
