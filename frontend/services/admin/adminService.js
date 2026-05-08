import axios from "axios";

const API = "http://localhost:5000/api/admin";

export const getAdminStats = (token) =>
  axios.get(`${API}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const getAdminUsers = (token) =>
  axios.get(`${API}/users`, authHeaders(token));

export const deleteAdminUser = (token, userId) =>
  axios.delete(`${API}/users/${userId}`, authHeaders(token));

export const blockAdminUser = (token, userId) =>
  axios.put(`${API}/users/${userId}/block`, {}, authHeaders(token));

export const getAdminJobs = (token) =>
  axios.get(`${API}/jobs`, authHeaders(token));

export const deleteAdminJob = (token, jobId) =>
  axios.delete(`${API}/jobs/${jobId}`, authHeaders(token));

export const getAdminApplications = (token) =>
  axios.get(`${API}/applications`, authHeaders(token));

export const deleteAdminApplication = (token, applicationId) =>
  axios.delete(`${API}/applications/${applicationId}`, authHeaders(token));
