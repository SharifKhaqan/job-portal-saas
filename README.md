# Job Portal SaaS

A full-stack MERN job portal SaaS for candidates, employers, and admins. The platform supports role-based dashboards, job posting, candidate applications, resume uploads, admin management, and smart Ai-Based job recommendations.

## Tech Stack

- Frontend: Next.js App Router, React, Tailwind CSS, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentication: JWT and bcrypt
- Uploads: Multer for resume files
- Recommendations: Skill matching with optional OpenAI embeddings

## Features

- Candidate registration, login, profile management, resume upload, job browsing, and application tracking
- Employer dashboard for posting jobs, managing listings, reviewing applications, and accepting or rejecting candidates
- Admin dashboard for managing users, jobs, applications, and analytics
- Role-based routing and protected backend endpoints
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

frontend/
  app/             Next.js App Router pages and global styles
  components/      Auth and dashboard UI components
  services/        Axios API clients grouped by feature
```

## Getting Started

Clone the repository and install dependencies for both apps.

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=optional_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

`OPENAI_API_KEY` is optional. If it is not provided, the recommendation system uses a local fallback.

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000), and the backend runs on [http://localhost:5000](http://localhost:5000).

## Available Scripts

Backend:

- `npm run dev` starts the backend with nodemon.
- `npm start` starts the backend with Node.

Frontend:

- `npm run dev` starts the Next.js development server.
- `npm run build` creates a production build.
- `npm run start` starts the production server.
- `npm run lint` runs ESLint.


