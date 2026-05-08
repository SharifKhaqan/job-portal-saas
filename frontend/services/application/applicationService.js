import axios from "axios";

const API = "http://localhost:5000/api/applications";

export const getMyApplications = (token) =>
  axios.get(`${API}/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getEmployerApplications = (token) =>
  axios.get(`${API}/for-my-jobs`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const createApplication = (token, payload) =>
  axios.post(API, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

export const updateApplicationStatus = (token, applicationId, status) =>
  axios.patch(
    `${API}/${applicationId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
