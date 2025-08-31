import axios from "axios";
import { getAuth } from "./auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const login = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
  return res.data;
};

export const register = async (username: string, password: string, role: string) => {
  const res = await axios.post(`${API_BASE}/auth/register`, { username, password, role });
  return res.data;
};

export const getStreams = async () => {
  const { token } = getAuth();
  const res = await axios.get(`${API_BASE}/streams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const startStream = async (title: string) => {
  const { token } = getAuth();
  const res = await axios.post(
    `${API_BASE}/streams`,
    { title },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getVODs = async () => {
  const { token } = getAuth();
  const res = await axios.get(`${API_BASE}/videos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
