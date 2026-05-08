import axios from "axios";

const API = "http://localhost:5000/api/user";

export const updateUserProfile = ({ token, formData }) =>
  axios.put(`${API}/profile`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });
