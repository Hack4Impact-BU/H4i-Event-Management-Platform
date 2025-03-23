# H4i-Event-Management-Platform
An all in one platform to help the E-Board organize events and capture data to aggregate into club trends

## Prerequisites
1. Clone the repository
2. Install `npm`, `react`, and `node`.

## Backend Setup (Node.js + Express)

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the backend directory and configure environment variables (example below):
   ```sh
   MONGO_URI=
   ```
4. Create a `credentials` directory in the backend directory:
   ```
   mkdir credentials
   ```
5. Add the `credentials.json` file in the credentials directory

6. Start the backend server:
   ```sh
   node index.js
   ```

## Frontend Setup (React)

1. In a new terminal, navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```
