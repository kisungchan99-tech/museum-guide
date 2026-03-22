"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname },
        },
      });

      if (error) {
        setMessage({ type: "error", text: "회원가입에 실패했습니다. 다시 시도해주세요." });
        setLoading(false);
        return;
      }

      setMessage({ type: "success", text: "가입 완료! 이메일을 확인해주세요." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: "이메일 또는 비밀번호가 올바르지 않습니다." });
        setLoading(false);
        return;
      }

      router.push("/");
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <h1 className="text-2xl font-bold text-zinc-900">
        {isSignUp ? "회원가입" : "로그인"}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {isSignUp
          ? "박물관 탐험대에 가입하고 리뷰를 남겨보세요"
          : "로그인하고 리뷰, 즐겨찾기, AI 추천을 이용하세요"}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4">
        {isSignUp && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="가족 닉네임 (예: 홍길동네 가족)"
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            required
            minLength={6}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "처리 중..." : isSignUp ? "가입하기" : "로그인"}
        </button>
      </form>

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setMessage(null);
        }}
        className="mt-6 text-sm text-zinc-500 hover:text-blue-600"
      >
        {isSignUp ? "이미 계정이 있나요? 로그인" : "계정이 없나요? 회원가입"}
      </button>
    </div>
  );
}
