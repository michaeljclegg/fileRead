# Technical Documentation: Index Files AI

## Architecture

The application is built using **Nuxt 3** (Vue.js framework) and utilizes **Tailwind CSS** for styling. It operates as a client-side application that interacts with the Google Gemini API.

## Pages

### `app/pages/index.vue`

The main entry point of the application.

- **State Management:**
  - `view`: Controls the current screen (`'upload'` or `'chat'`).
  - `uploadedFiles`: Array of `FileUploadState` objects representing the selected files.
  - `isProcessing`: Boolean flag for the processing state.
  - `progress`: Number (0-100) representing the processing progress.
- **Logic:**
  - Manages the transition between the file selection/upload view and the chat view.
  - Simulates the "processing" delay to provide visual feedback.
  - Passes state down to child components.

## Components

### `app/components/FolderSelect.vue`

- **Purpose:** Handles the folder selection input.
- **Props:**
  - `compact` (boolean): Toggles between a large centered layout and a compact horizontal bar.
- **Events:**
  - `filesSelected`: Emitted when the user selects a folder, passing the `FileList`.
- **Features:**
  - Uses `<input type="file" webkitdirectory>` for folder selection.
  - Visual feedback for drag/drop (implied by styling) or click-to-select.

### `app/components/FileList.vue`

- **Purpose:** Displays the list of files selected by the user.
- **Props:**
  - `files`: Array of `FileUploadState`.
- **Logic:** Iterates through the files and renders a `FileListItem` for each.

### `app/components/FileListItem.vue`

- **Purpose:** Renders a single file item in the list.
- **Props:**
  - `file`: The `FileUploadState` object for the specific file.
- **Features:** Shows file name, size, and status (icon).

### `app/components/UploadControls.vue`

- **Purpose:** Provides action buttons for the upload view.
- **Props:**
  - `onProcess`: Function to trigger processing.
  - `onClear`: Function to clear the file list.
  - `canProcess`: Boolean to enable/disable the process button.
  - `isProcessing`: Boolean to show loading state on the button.

### `app/components/UploadProgress.vue`

- **Purpose:** Visual progress bar.
- **Props:**
  - `progress`: Current progress percentage.
  - `isProcessing`: Whether processing is active.
  - `processedFiles`: Count of processed files.
  - `totalFiles`: Total count of files.

### `app/components/ChatView.vue`

- **Purpose:** The main container for the chat interface.
- **Props:**
  - `uploadedFiles`: The processed files to be used as context.
- **Events:**
  - `back`: Emitted to return to the upload view.
  - `reset`: Emitted to clear everything and return to start.
- **Logic:**
  - Manages the chat history (`messages` array).
  - Handles user input submission.
  - Calls `fileSearchService.queryFileSearchStore` to get AI responses.

### `app/components/ChatMessage.vue`

- **Purpose:** Renders a single chat message.
- **Props:**
  - `message`: The `ChatMessage` object.
- **Features:**
  - Distinguishes between `USER` and `AI` messages for styling (alignment, colors).
  - Supports Markdown rendering (implied for AI responses).

## Services & Utils

### `app/utils/fileSearchService.ts`

- **`fileToGenerativePart(file: File)`**:
  - Converts a browser `File` object into a format compatible with the Gemini API.
  - **PDFs:** read as Data URL -> Base64 string.
  - **Text:** read as plain text.
- **`queryFileSearchStore(query, uploadedFiles, onChunk)`**:
  - Initializes the `GoogleGenAI` client with the API key.
  - Filters for successfully uploaded files.
  - Constructs a prompt containing the file contents and the user's query.
  - Streams the response from the `gemini-2.5-flash` model.

## Types (`app/types/types.ts`)

- **`MessageSender`**: Enum (`USER`, `AI`).
- **`ChatMessage`**: Interface (`sender`, `text`, `isLoading`).
- **`UploadStatus`**: Enum (`PENDING`, `UPLOADING`, `PROCESSING`, `SUCCESS`, `ERROR`).
- **`FileMetadata`**: Interface (`name`, `size`, `type`, `path`).
- **`FileUploadState`**: Interface (`file`, `status`, `metadata`, `error`).
