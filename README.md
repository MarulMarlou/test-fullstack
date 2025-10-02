# Test Fullstack App

A compact full-stack playground that serves a very large in-memory dataset through an Express API and renders it with a React UI. The project demonstrates batched queue processing on the backend and infinite scrolling with selection management on the frontend.

## Features

- **Backend (Express + Node.js)**
  - Generates 1,000,000 synthetic items on startup.
  - Queue-based batching for add/select/sort operations to keep the store consistent under load.
  - REST endpoints for pagination (/api/items), selection toggling (/api/select), ordering (/api/sort) and state persistence (/api/state).

- **Frontend (React + Axios)**
  - Two-panel layout: “All items” with infinite scroll, and “Selected items” with drag & drop ordering.
  - Local persistence of the selected list via localStorage.
  - Modern styling with subtle gradients, custom scrollbars and draggable handles.

## Prerequisites

- Node.js >= 18
- npm (comes with Node.js)

## Project Structure

`
backend/
  src/
    server.js
    controllers/
    services/
    utils/
frontend/
  src/
    components/
    hooks/
`

## Getting Started

### 1. Clone the repository

`ash
git clone https://github.com/MarulMarlou/test-fullstack.git
cd test-fullstack
`

### 2. Install dependencies

Backend:
`ash
cd backend
npm install
`

Frontend:
`ash
cd ../frontend
npm install
`

### 3. Run the apps

Start the API server (from ackend directory):
`ash
node src/server.js
`
The server listens on http://localhost:4000 by default.

Start the React dev server (from rontend directory):
`ash
npm start
`
This launches the UI on http://localhost:3000 with hot reload.

Ensure both servers are running to experience the full application.

## API Overview

| Method | Endpoint          | Description                                      |
|--------|-------------------|--------------------------------------------------|
| GET    | /api/items      | Paginated items list (offset, limit, selected, ilter). |
| POST   | /api/items      | Add a new item by ID (batched via queue).       |
| POST   | /api/select     | Toggle selection for an array of IDs.           |
| POST   | /api/sort       | Persist ordering for the selected collection.   |
| GET    | /api/state      | Fetch persisted selection state.                |
| POST   | /api/state      | Overwrite selection state (used for restore).   |

## Styling & UX Notes

- Infinite scroll fetches items in batches of 20 for both panels.
- Selected items can be reordered via drag handles; changes persist across reloads.
- The layout is responsive down to tablet widths.

## License

This project is provided for educational purposes. Use freely.
