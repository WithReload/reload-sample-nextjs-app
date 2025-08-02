"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Callback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This contains our code verifier
  const [status, setStatus] = useState("Processing authentication...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const exchangeCode = async () => {
      if (!code) {
        setError("No authorization code received");
        return;
      }

      // Try to get code verifier from state parameter first, then fallback to sessionStorage
      let codeVerifier = state;

      if (!codeVerifier) {
        codeVerifier = sessionStorage.getItem("code_verifier");
      }

      // Debug logging
      

      if (!codeVerifier) {
        setError("No code verifier found. Please try connecting again.");
        return;
      }

      setStatus("Exchanging authorization code for tokens...");

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
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to exchange code");
        }

        const tokens = await response.json();
        localStorage.setItem("reload_wallet_token", tokens.wallet_token);
        localStorage.setItem("reload_refresh_token", tokens.refresh_token);

        setStatus("Authentication successful! Redirecting...");

        // Clear the code verifier after successful exchange
        sessionStorage.removeItem("code_verifier");

        // Small delay to show success message
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        console.error("Token exchange error:", error);
        setError(error.message || "Authentication failed. Please try again.");

        // Clear the code verifier on error
        sessionStorage.removeItem("code_verifier");
      }
    };

    exchangeCode();
  }, [code, state, router]);

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
          <div className='text-center'>
            <div className='text-red-500 text-6xl mb-4'>⚠️</div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Authentication Error
            </h2>
            <p className='text-gray-600 mb-4'>{error}</p>
            <button
              onClick={() => router.push("/")}
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Processing
          </h2>
          <p className='text-gray-600'>{status}</p>
        </div>
      </div>
    </div>
  );
}
