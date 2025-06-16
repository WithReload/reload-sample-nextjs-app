// pages/index.js
"use client";

import { useEffect, useState } from "react";
import ResponseDisplay from "./components/ResponseDisplay";
import {
  REDIRECT_URI,
  RELOAD_APP_ID,
  RELOAD_BASE_URL,
} from "./constants/general";

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [activeTab, setActiveTab] = useState("wallet");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Separate response states for each tab
  const [walletResponse, setWalletResponse] = useState(null);
  const [specificResponse, setSpecificResponse] = useState(null);
  const [previewResponse, setPreviewResponse] = useState(null);
  const [chargeResponse, setChargeResponse] = useState(null);
  const [platformResponse, setPlatformResponse] = useState(null);

  // Separate error states for each tab
  const [walletError, setWalletError] = useState(null);
  const [specificError, setSpecificError] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [chargeError, setChargeError] = useState(null);
  const [platformError, setPlatformError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("reload_access_token");
    const refresh = localStorage.getItem("reload_refresh_token");
    setAccessToken(token);
    setRefreshToken(refresh);
  }, []);

  const refreshAccessToken = async () => {
    try {
      const response = await fetch("/api/oauth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const tokens = await response.json();
      localStorage.setItem("reload_access_token", tokens.access_token);
      localStorage.setItem("reload_refresh_token", tokens.refresh_token);
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      return tokens.access_token;
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, clear tokens and redirect to login
      localStorage.removeItem("reload_access_token");
      localStorage.removeItem("reload_refresh_token");
      setAccessToken(null);
      setRefreshToken(null);
      throw error;
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401 && refreshToken) {
        // Token expired, try to refresh
        const newAccessToken = await refreshAccessToken();
        // Retry the request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const connectWallet = () => {
    setIsConnecting(true);

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateRandomString(64);
    localStorage.setItem("code_verifier", codeVerifier);

    const codeChallenge = base64URLEncode(sha256(codeVerifier));

    const authUrl = new URL(`${RELOAD_BASE_URL}/oauth/authorize`);
    authUrl.searchParams.set("client_id", RELOAD_APP_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set(
      "scope",
      "wallet:read transactions:read transactions:write wallet:write"
    );
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    window.location.href = authUrl.toString();
  };

  const handleWalletTransactions = async (e) => {
    e.preventDefault();
    setWalletError(null);
    setWalletResponse(null);

    const formData = new FormData(e.target);
    const limit = formData.get("limit");
    const startDate = formData.get("start_date");
    const endDate = formData.get("end_date");

    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await makeAuthenticatedRequest(
        `/api/wallet/transactions?${params}`
      );
      const data = await res.json();
      setWalletResponse(data);
    } catch (err) {
      setWalletError(err.message);
    }
  };

  const handleSpecificTransaction = async (e) => {
    e.preventDefault();
    setSpecificError(null);
    setSpecificResponse(null);

    const formData = new FormData(e.target);
    const transactionId = formData.get("transaction_id");

    try {
      const res = await makeAuthenticatedRequest(
        `/api/wallet/transactions/${transactionId}`
      );
      const data = await res.json();
      setSpecificResponse(data);
    } catch (err) {
      setSpecificError(err.message);
    }
  };

  const handlePreviewCharge = async (e) => {
    e.preventDefault();
    setPreviewError(null);
    setPreviewResponse(null);

    const formData = new FormData(e.target);
    const amount = formData.get("amount");
    const amountType = formData.get("amount_type");

    try {
      const res = await makeAuthenticatedRequest("/api/wallet/preview-charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          amount_type: amountType,
        }),
      });
      const data = await res.json();
      setPreviewResponse(data);
    } catch (err) {
      setPreviewError(err.message);
    }
  };

  const handleCharge = async (e) => {
    e.preventDefault();
    setChargeError(null);
    setChargeResponse(null);

    const formData = new FormData(e.target);
    const amount = formData.get("amount");
    const amountType = formData.get("amount_type");
    const description = formData.get("description");

    try {
      const res = await makeAuthenticatedRequest("/api/wallet/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          amount_type: amountType,
          usage_details: {
            description,
            metadata: {},
          },
        }),
      });
      const data = await res.json();
      setChargeResponse(data);
    } catch (err) {
      setChargeError(err.message);
    }
  };

  const handlePlatformTransactions = async (e) => {
    e.preventDefault();
    setPlatformError(null);
    setPlatformResponse(null);

    const formData = new FormData(e.target);
    const page = formData.get("page");
    const limit = formData.get("limit");
    const startDate = formData.get("start_date");
    const endDate = formData.get("end_date");

    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await fetch(`/api/platform/transactions?${params}`);
      const data = await res.json();
      setPlatformResponse(data);
    } catch (err) {
      setPlatformError(err.message);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("reload_access_token");
    localStorage.removeItem("reload_refresh_token");
    setAccessToken(null);
    setRefreshToken(null);
  };

  const handleRefreshToken = async () => {
    if (!refreshToken) return;

    setIsRefreshing(true);
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error("Failed to refresh token:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className='container mx-auto p-8 bg-white min-h-screen'>
      <h1 className='text-3xl font-bold mb-8 text-gray-900'>Test App</h1>

      {!accessToken ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm transition-colors mb-8'
        >
          {isConnecting ? "Connecting..." : "Connect Reload Wallet"}
        </button>
      ) : (
        <div className='space-y-6'>
          <div className='flex gap-4 mb-8'>
            <button
              onClick={disconnectWallet}
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm transition-colors'
            >
              Disconnect Wallet
            </button>
            <button
              onClick={handleRefreshToken}
              disabled={isRefreshing}
              className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-sm transition-colors'
            >
              {isRefreshing ? "Refreshing..." : "Refresh Token"}
            </button>
          </div>

          {/* Tabs */}
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8'>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`${
                  activeTab === "wallet"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Wallet Transactions
              </button>
              <button
                onClick={() => setActiveTab("specific")}
                className={`${
                  activeTab === "specific"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Specific Transaction
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`${
                  activeTab === "preview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Preview Charge
              </button>
              <button
                onClick={() => setActiveTab("charge")}
                className={`${
                  activeTab === "charge"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Charge
              </button>
              <button
                onClick={() => setActiveTab("platform")}
                className={`${
                  activeTab === "platform"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Platform Transactions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className='mt-6'>
            {activeTab === "wallet" && (
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Get Wallet Transactions
                </h2>
                <form
                  className='flex flex-col gap-4'
                  onSubmit={handleWalletTransactions}
                >
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <label className='text-sm text-gray-700'>
                      Limit:
                      <input
                        type='number'
                        name='limit'
                        defaultValue={10}
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      Start Date:
                      <input
                        type='date'
                        name='start_date'
                        className='border border-gray-300 rounded px-2 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      End Date:
                      <input
                        type='date'
                        name='end_date'
                        className='border border-gray-300 rounded px-2 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                  </div>
                  <button
                    type='submit'
                    className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-fit shadow-sm transition-colors'
                  >
                    Get Wallet Transactions
                  </button>
                </form>
                <ResponseDisplay data={walletResponse} error={walletError} />
              </div>
            )}

            {activeTab === "specific" && (
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Get Specific Transaction
                </h2>
                <form
                  className='flex flex-col gap-4'
                  onSubmit={handleSpecificTransaction}
                >
                  <label className='text-sm text-gray-700'>
                    Transaction ID:
                    <input
                      type='text'
                      name='transaction_id'
                      placeholder='tx_123'
                      className='border border-gray-300 rounded px-2 py-1 ml-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </label>
                  <button
                    type='submit'
                    className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-fit shadow-sm transition-colors'
                  >
                    Get Transaction Details
                  </button>
                </form>
                <ResponseDisplay
                  data={specificResponse}
                  error={specificError}
                />
              </div>
            )}

            {activeTab === "preview" && (
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Preview Charge
                </h2>
                <form
                  className='flex flex-col gap-4'
                  onSubmit={handlePreviewCharge}
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <label className='text-sm text-gray-700'>
                      Amount:
                      <input
                        type='number'
                        name='amount'
                        defaultValue={100}
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      Amount Type:
                      <input
                        type='text'
                        name='amount_type'
                        defaultValue='platform_credits'
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                  </div>
                  <button
                    type='submit'
                    className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-fit shadow-sm transition-colors'
                  >
                    Preview Charge
                  </button>
                </form>
                <ResponseDisplay data={previewResponse} error={previewError} />
              </div>
            )}

            {activeTab === "charge" && (
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-gray-900'>Charge</h2>
                <form className='flex flex-col gap-4' onSubmit={handleCharge}>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <label className='text-sm text-gray-700'>
                      Amount:
                      <input
                        type='number'
                        name='amount'
                        defaultValue={100}
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      Amount Type:
                      <input
                        type='text'
                        name='amount_type'
                        defaultValue='platform_credits'
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      Description:
                      <input
                        type='text'
                        name='description'
                        defaultValue='Test charge'
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                  </div>
                  <button
                    type='submit'
                    className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-fit shadow-sm transition-colors'
                  >
                    Charge
                  </button>
                </form>
                <ResponseDisplay data={chargeResponse} error={chargeError} />
              </div>
            )}

            {activeTab === "platform" && (
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Get Platform Transactions
                </h2>
                <form
                  className='flex flex-col gap-4'
                  onSubmit={handlePlatformTransactions}
                >
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                    <label className='text-sm text-gray-700'>
                      Page:
                      <input
                        type='number'
                        name='page'
                        defaultValue={1}
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      Limit:
                      <input
                        type='number'
                        name='limit'
                        defaultValue={10}
                        className='border border-gray-300 rounded px-2 py-1 ml-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      Start Date:
                      <input
                        type='date'
                        name='start_date'
                        className='border border-gray-300 rounded px-2 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                    <label className='text-sm text-gray-700'>
                      End Date:
                      <input
                        type='date'
                        name='end_date'
                        className='border border-gray-300 rounded px-2 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </label>
                  </div>
                  <button
                    type='submit'
                    className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-fit shadow-sm transition-colors'
                  >
                    Get Platform Transactions
                  </button>
                </form>
                <ResponseDisplay
                  data={platformResponse}
                  error={platformError}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for PKCE
function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function base64URLEncode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}
