"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/app/components/FullScreenLoader";
import Toast from "@/app/components/Toast";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (res.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push("/signin");
        }, 500);
      } else {
        const data = await res.json();
        setError(data.error || "Register failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[100vw] max-w-[430px] h-screen mx-auto bg-[#232336] flex flex-col items-center justify-between p-0 sm:rounded-none sm:w-full">
      {loading && <FullScreenLoader />}
      <Toast message="Registration successful!" show={showToast} />
      <div className="flex flex-col items-center w-full mt-10 px-6">
        <div className="w-full flex justify-center mb-6">
          <Image
            src="/signin_illustration_img.svg"
            alt="Welcome Illustration"
            width={160}
            height={160}
            priority
          />
        </div>
        <h1 className="text-white text-2xl font-bold text-center mb-2 leading-snug">
          Welcome!
        </h1>
        <p className="text-[#E3E3E3] text-base text-center mb-6">
          Create your account
        </p>
        <form
          className="w-full flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full max-w-[340px] bg-[#E3E3E3] text-[#7B61FF] rounded-xl px-4 py-3 mb-4 outline-none font-semibold placeholder-[#7B61FF]"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full max-w-[340px] bg-[#E3E3E3] text-[#7B61FF] rounded-xl px-4 py-3 mb-4 outline-none font-semibold placeholder-[#7B61FF]"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full max-w-[340px] bg-[#E3E3E3] text-[#7B61FF] rounded-xl px-4 py-3 mb-4 outline-none font-semibold placeholder-[#7B61FF]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full max-w-[340px] bg-[#7B61FF] text-white text-lg font-semibold rounded-full py-4 mb-4 flex items-center justify-center gap-2 shadow-md"
            type="submit"
            disabled={loading}
          >
            Sign Up
          </button>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
          >
            <img
              src={showPassword ? "/eye.svg" : "/eye-slash.svg"}
              alt={showPassword ? "Hide password" : "Show password"}
              width={22}
              height={22}
            />
          </button>
        </form>
      </div>
    </div>
  );
}
