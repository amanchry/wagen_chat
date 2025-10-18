import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const token = session?.user?.token;
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Unauthorized — logging out...");
      await signOut({ callbackUrl: "/auth/login" });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
