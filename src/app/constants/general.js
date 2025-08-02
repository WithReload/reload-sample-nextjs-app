// Client-side configuration for Reload API
// This file can be imported by both client and server code

export const RELOAD_BASE_URL = "https://app.withreload.com";
export const RELOAD_API_URL = "https://api.withreload.com/v1";

// Client-side accessible variables (must be prefixed with NEXT_PUBLIC_)
export const RELOAD_APP_ID = process.env.NEXT_PUBLIC_RELOAD_APP_ID || "";

// Redirect URI for OAuth callback (client-side accessible)
export const REDIRECT_URI =
  process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3001/callback";

// OAuth Scopes
export const OAUTH_SCOPES = [
  "wallet:read",
  "transactions:read",
  "transactions:write",
  "wallet:write",
].join(" ");
