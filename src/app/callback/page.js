"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Callback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    const exchangeCode = async () => {
      if (!code) return;

      const codeVerifier = localStorage.getItem("code_verifier");

      try {
        const response = await fetch("/api/oauth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            codeVerifier: codeVerifier,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code");
        }

        const tokens = await response.json();
        localStorage.setItem("reload_access_token", tokens.access_token);
        localStorage.setItem("reload_refresh_token", tokens.refresh_token);

        router.push("/");
      } catch (error) {
        console.error("Token exchange error:", error);
      }
    };

    exchangeCode();
  }, [code]);

  return <div>Processing...</div>;
}
