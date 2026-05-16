import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/jobs` 
  : "http://localhost:5000/api/jobs";

export const getAllJobs = (token) =>
  axios.get(API, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });

export const createJob = (token, payload) =>
  axios.post(API, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

export const deleteJob = (token, jobId) =>
  axios.delete(`${API}/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
