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