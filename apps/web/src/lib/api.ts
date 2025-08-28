import axios from "axios";
import { getToken } from "./auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const login = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
  return res.data.token;
};

export const register = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/register`, { username, password });
  return res.data.token;
};

export const getStreams = async () => {
  const token = getToken();
  const res = await axios.get(`${API_BASE}/streams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getVODs = async () => {
  const res = await axios.get(`${API_BASE}/videos`);
  return res.data;
};
