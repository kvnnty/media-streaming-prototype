"use client";
import { register } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "broadcaster">("user"); // default role
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, password, role);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-8 border border-gray-300 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
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

        <select value={role} onChange={(e) => setRole(e.target.value as "user" | "broadcaster")} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option value="user">User</option>
          <option value="broadcaster">broadcaster</option>
        </select>

        <button type="submit" className="cursor-pointer w-full bg-black text-white py-2 rounded-lg hover:bg-opacity-70 transition-colors">
          Register
        </button>
        <Link href="/login" className="text-center underline">
          Login
        </Link>
      </form>
      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
    </div>
  );
}
