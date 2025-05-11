"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/app/components/FullScreenLoader";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        document.cookie = `token=${data.token}; path=/; max-age=604800`; // 7 hari
        router.push("/main-app");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[100vw] max-w-[430px] h-screen mx-auto bg-[#232336] flex flex-col items-center justify-between p-0 sm:rounded-none sm:w-full">
      {loading && <FullScreenLoader />}
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
          Login to your account
        </p>
        <form
          className="w-full flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full max-w-[340px] bg-[#E3E3E3] text-[#232336] rounded-xl px-4 py-3 mb-4 outline-none font-semibold placeholder-[#7B61FF]"
            placeholder="Username or Email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full max-w-[340px] bg-[#E3E3E3] text-[#232336] rounded-xl px-4 py-3 mb-4 outline-none font-semibold placeholder-[#7B61FF]"
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
            Sign In
          </button>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        </form>
        <div className="flex items-center w-full max-w-[340px] my-4">
          <div className="flex-1 h-px bg-[#E3E3E3]" />
          <span className="mx-2 text-[#E3E3E3] text-sm">Or sign in with</span>
          <div className="flex-1 h-px bg-[#E3E3E3]" />
        </div>
        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md mx-auto mb-4 overflow-hidden">
          <Image
            src="/login_google_icon.svg"
            alt="Google"
            width={28}
            height={28}
            style={{ objectFit: "cover" }}
          />
        </button>
        <p className="text-[#E3E3E3] text-sm text-center mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#7B61FF] font-semibold">
            Sign Up Here
          </Link>
        </p>
      </div>
    </div>
  );
}
