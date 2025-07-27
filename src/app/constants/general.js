// export const RELOAD_BASE_URL = "https://app.withreload.com";
// export const RELOAD_API_URL = "https://api.withreload.com/oauth";
// export const RELOAD_BASE_URL = "http://localhost:3000";
// export const RELOAD_API_URL = "http://localhost:3000/api/v1";
// export const RELOAD_OAUTH_API_URL = "http://localhost:3000/api/v1/oauth";

export const RELOAD_BASE_URL = "http://localhost:3000";
// export const RELOAD_BASE_URL = "https://staging.withreload.com";
export const RELOAD_API_URL = "http://localhost:3000/api/v1";
export const RELOAD_OAUTH_API_URL = "http://localhost:3000/api/v1/oauth";

export const RELOAD_APP_ID =
  "e45d5dc9d7899ca1ffc0433dcc16653b4d6205ba021b578e54a790c582e388fd";
export const RELOAD_CLIENT_SECRET =
  "4534f86da040f2ae0d95fe26b99b8cdc37129735e376f4472614b6eb2d2cfd5ddccea006c6c564bca1a6bf5121fc4493cf1746c37bfeac0e071fc1febb17f718";
export const REDIRECT_URI = "http://localhost:3001/callback";

// OAuth Scopes
export const OAUTH_SCOPES = [
  "wallet:read",
  "transactions:read",
  "transactions:write",
  "wallet:write",
].join(" ");
