import axios from "axios";

export const axiosInstance = axios.create({
      baseURL: "https://sayhiibackend.onrender.com",
// baseURL: import.meta.env.MODE === "development" ? "https://sayhiibackend.onrender.com" : "/api",
  withCredentials: true,
});
