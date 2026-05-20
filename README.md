# Job Portal SaaS (Backend)

This repository contains the backend code for the full-stack MERN Job Portal SaaS platform. The platform supports role-based dashboards, job posting, candidate applications, resume uploads, admin management, and smart AI-based job recommendations.

> **Note**: The frontend code for this project has been moved to a separate repository.

## Tech Stack

- **Framework**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT and bcrypt
- **Uploads**: Multer for resume files
- **Recommendations**: Skill matching with optional OpenAI embeddings

## Features

- Candidate registration, login, profile management, and resume upload handling
- Employer endpoints for posting jobs, managing listings, reviewing applications, and accepting or rejecting candidates
- Admin endpoints for managing users, jobs, applications, and system analytics
- Role-based routing and protected endpoints
- Smart job recommendations based on candidate skills/profile and job requirements

## Project Structure

```text
backend/
  controllers/     Request handlers for auth, users, jobs, applications, and admin actions
  middleware/      Auth, role checks, optional auth, and resume upload handling
  models/          Mongoose models
  routes/          Express route definitions
  utils/           Recommendation helpers
  server.js        Express app entry point
```

## Getting Started

Clone the repository and install dependencies.

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=optional_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

*`OPENAI_API_KEY` is optional. If it is not provided, the recommendation system uses a local fallback.*

## Run Locally

Start the backend server:

```bash
cd backend
npm run dev
```

The backend runs on [http://localhost:5000](http://localhost:5000) by default.

## Available Scripts

- `npm run dev`: Starts the backend with `nodemon` for development.
- `npm start`: Starts the backend with Node (for production).
