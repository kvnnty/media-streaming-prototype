"use client";
import { login } from "@/lib/api";
import { saveToken } from "@/lib/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      saveToken(token);
      router.push("/live");
    } catch (err: any) {
      setError(err.response.data.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-8 border border-gray-300 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button type="submit" className="cursor-pointer w-full bg-black text-white py-2 rounded-lg hover:bg-opacity-70 transition-colors">
          Login
        </button>
        <Link href="/register" className="text-center underline">
          Register
        </Link>
      </form>
      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
    </div>
  );
}
