// pages/index.js
"use client";

import { useEffect, useState } from "react";
import ChargeTab from "./components/ChargeTab";
import PlatformTransactionsTab from "./components/PlatformTransactionsTab";
import PreviewChargeTab from "./components/PreviewChargeTab";
import SpecificTransactionTab from "./components/SpecificTransactionTab";
import WalletTransactionsTab from "./components/WalletTransactionsTab";
import {
  OAUTH_SCOPES,
  REDIRECT_URI,
  RELOAD_APP_ID,
  RELOAD_BASE_URL,
} from "./constants/general";

export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletToken, setWalletToken] = useState(null);
  const [activeTab, setActiveTab] = useState("wallet");

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
    const token = localStorage.getItem("reload_wallet_token");
    setWalletToken(token);
  }, []);

  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${walletToken}`,
        },
      });

      if (response.status === 401) {
        // Token expired, clear and redirect to login
        localStorage.removeItem("reload_wallet_token");
        setWalletToken(null);
        throw new Error("Session expired. Please reconnect your wallet.");
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
    authUrl.searchParams.set("scope", OAUTH_SCOPES);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    window.location.href = authUrl.toString();
  };

  const handleWalletTransactions = async (data) => {
    setWalletError(null);
    setWalletResponse(null);
    try {
      const response = await fetch(
        `/api/wallet/transactions?${new URLSearchParams(data)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${walletToken}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch transactions");
      }
      setWalletResponse(result);
    } catch (error) {
      setWalletError(error.message);
    }
  };

  const handleSpecificTransaction = async (data) => {
    setSpecificError(null);
    setSpecificResponse(null);
    try {
      const response = await fetch(
        `/api/wallet/transactions/${data.transaction_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${walletToken}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch transaction");
      }
      setSpecificResponse(result);
    } catch (error) {
      setSpecificError(error.message);
    }
  };

  const handlePreviewCharge = async (data) => {
    setPreviewError(null);
    setPreviewResponse(null);
    try {
      const response = await fetch("/api/wallet/preview-charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${walletToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to preview charge");
      }
      setPreviewResponse(result);
    } catch (error) {
      setPreviewError(error.message);
    }
  };

  const handleCharge = async (data) => {
    setChargeError(null);
    setChargeResponse(null);
    try {
      const response = await fetch("/api/wallet/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${walletToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to charge wallet");
      }
      setChargeResponse(result);
    } catch (error) {
      setChargeError(error.message);
    }
  };

  const handlePlatformTransactions = async (data) => {
    setPlatformError(null);
    setPlatformResponse(null);
    try {
      const response = await fetch(
        `/api/platform/transactions?${new URLSearchParams(data)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || "Failed to fetch platform transactions"
        );
      }
      setPlatformResponse(result);
    } catch (error) {
      setPlatformError(error.message);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("reload_wallet_token");
    setWalletToken(null);
    setWalletResponse(null);
    setSpecificResponse(null);
    setPreviewResponse(null);
    setChargeResponse(null);
    setPlatformResponse(null);
  };

  if (!walletToken) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12'>
            {/* Hero Section */}
            <div className='text-center mb-16'>
              <h1 className='text-5xl font-bold text-gray-900 mb-6'>
                Welcome to Reload
              </h1>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
                A powerful platform for managing digital wallets and
                transactions. Experience seamless integration with our
                comprehensive API suite.
              </p>
              <a
                href='https://docs.withreload.com'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
              >
                <svg
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                  />
                </svg>
                View Documentation
              </a>
            </div>

            {/* Feature Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
                  <svg
                    className='h-6 w-6 text-blue-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Secure Authentication
                </h3>
                <p className='text-gray-600'>
                  OAuth 2.0 authentication flow with PKCE for enhanced security.
                </p>
              </div>

              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
                  <svg
                    className='h-6 w-6 text-green-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Wallet Management
                </h3>
                <p className='text-gray-600'>
                  Easily manage digital wallets with comprehensive controls.
                </p>
              </div>

              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
                  <svg
                    className='h-6 w-6 text-purple-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Transaction History
                </h3>
                <p className='text-gray-600'>
                  Track and manage all your transactions with detailed history.
                </p>
              </div>

              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4'>
                  <svg
                    className='h-6 w-6 text-orange-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Charge & Refund
                </h3>
                <p className='text-gray-600'>
                  Process charges and refunds with real-time preview
                  capabilities.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className='text-center'>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className='inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105'
              >
                {isConnecting ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-6 w-6 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg
                      className='h-6 w-6 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                    Connect Your Wallet
                  </>
                )}
              </button>
              <p className='mt-4 text-sm text-gray-500'>
                By connecting your wallet, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
          {/* Header */}
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Reload API Demo
            </h1>
            <button
              onClick={disconnectWallet}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200'
            >
              <svg
                className='h-5 w-5 mr-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              Disconnect Wallet
            </button>
          </div>

          {/* Tabs */}
          <div className='border-b border-gray-200 mb-8'>
            <nav className='-mb-px flex space-x-8'>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`${
                  activeTab === "wallet"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Wallet Transactions
              </button>
              <button
                onClick={() => setActiveTab("specific")}
                className={`${
                  activeTab === "specific"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Specific Transaction
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`${
                  activeTab === "preview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Preview Charge
              </button>
              <button
                onClick={() => setActiveTab("charge")}
                className={`${
                  activeTab === "charge"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Charge
              </button>
              <button
                onClick={() => setActiveTab("platform")}
                className={`${
                  activeTab === "platform"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Platform Transactions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className='mt-8'>
            {activeTab === "wallet" && (
              <WalletTransactionsTab
                onFetchTransactions={handleWalletTransactions}
                response={walletResponse}
                error={walletError}
              />
            )}
            {activeTab === "specific" && (
              <SpecificTransactionTab
                onFetchTransaction={handleSpecificTransaction}
                response={specificResponse}
                error={specificError}
              />
            )}
            {activeTab === "preview" && (
              <PreviewChargeTab
                onPreviewCharge={handlePreviewCharge}
                response={previewResponse}
                error={previewError}
              />
            )}
            {activeTab === "charge" && (
              <ChargeTab
                onCharge={handleCharge}
                response={chargeResponse}
                error={chargeError}
              />
            )}
            {activeTab === "platform" && (
              <PlatformTransactionsTab
                onFetchTransactions={handlePlatformTransactions}
                response={platformResponse}
                error={platformError}
              />
            )}
          </div>
        </div>
      </div>
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
