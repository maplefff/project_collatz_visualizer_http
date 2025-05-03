# Collatz Conjecture Visualizer (Electron + Vue + Node.js)

This project is an Electron application that visualizes the Collatz conjecture sequence.

## Project Structure

The project is organized as follows:

```
project_collatz_visualizer_http/
├── .cursor/rules/           # Cursor AI rules
├── collatz_visualizer_http/ # Application Core
│   ├── backend/             # Node.js/Express backend (Electron Main Process)
│   │   ├── main.js          # Electron main entry point
│   │   ├── src/             # Backend source code (server, routes)
│   │   └── package.json
│   ├── frontend/            # Vue.js/Vite frontend (Electron Renderer Process)
│   │   ├── src/             # Frontend source code (components, App.vue)
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   └── package.json         # Main application dependencies (Electron, concurrently)
├── collatz_icon.icns        # Application icon
├── collatz_icon.svg
├── .gitignore
└── README.md                # This file
```

*   **`/` (Project Core / Parent Directory):** Contains the overall project setup, documentation (`README.md`), and configuration (`.gitignore`, `.cursor/rules/`).
*   **`collatz_visualizer_http/` (Application Core / Root Directory):** Contains the Electron application itself.
    *   **`backend/`**: Runs in the Electron main process, handles logic and serves the API.
    *   **`frontend/`**: Runs in the Electron renderer process (the window), displays the UI.

## Technology Stack

*   **Framework:** [Electron](https://www.electronjs.org/)
*   **Frontend:** [Vue.js](https://vuejs.org/) with [Vite](https://vitejs.dev/)
*   **Backend:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
*   **Concurrency:** [concurrently](https://github.com/open-cli-tools/concurrently) (for development)
*   **Packaging:** [electron-builder](https://www.electron.build/)

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (includes npm)
*   Git

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/maplefff/project_collatz_visualizer_http.git
    cd project_collatz_visualizer_http
    ```
2.  Navigate to the application core directory:
    ```bash
    cd collatz_visualizer_http
    ```
3.  Install dependencies for the main app, backend, and frontend:
    ```bash
    npm install
    # The postinstall script should automatically install backend and frontend dependencies.
    # If not, install them manually:
    # cd backend && npm install && cd ..
    # cd frontend && npm install && cd ..
    ```

### Running in Development Mode

Navigate to the application core directory (`collatz_visualizer_http`) and run:

```bash
npm run dev
```

This will start the Vite development server for the frontend and the Electron main process concurrently.

## Building for Production

Navigate to the application core directory (`collatz_visualizer_http`) and run:

```bash
npm run build
```

This command will:

1.  Build the frontend code using Vite.
2.  Use `electron-builder` to package the application for your current platform into the `collatz_visualizer_http/dist-electron` directory.