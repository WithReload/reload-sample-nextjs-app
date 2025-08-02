# Reload Integration Sample App

This is a Next.js sample application demonstrating how to integrate with the Reload API for wallet connections, transactions, and payments.

## Features

- **OAuth 2.0 with PKCE**: Secure wallet connection flow
- **Wallet Management**: View wallet transactions and balance
- **Payment Processing**: Charge and refund functionality
- **Platform Transactions**: View platform-level transaction history
- **Token Management**: Automatic token refresh and session handling
- **Dual Authentication**: Support for both wallet tokens and client credentials

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Reload Developer Account
- Reload App credentials (Client ID and Client Secret)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/withreload/reload-sample-app.git
cd reload-sample-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure your Reload credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your Reload app credentials:

```env
# Required for client-side (OAuth flow)
NEXT_PUBLIC_RELOAD_APP_ID=your_client_id_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3001/callback

# Required for server-side (API calls)
RELOAD_CLIENT_SECRET=your_client_secret_here

# Optional server-side variables (will fallback to NEXT_PUBLIC_ versions)
RELOAD_APP_ID=your_client_id_here
REDIRECT_URI=http://localhost:3001/callback
```

### 4. Configure Redirect URI

In your Reload Developer Dashboard:
1. Navigate to your application settings
2. Add `http://localhost:3001/callback` to the "Redirect URIs" section
3. Save the configuration

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the application.

## Using Tunneling Services

If you need to use a tunneling service (like ngrok, localtunnel, etc.) because localhost redirect URIs are not allowed:

### 1. Set Up Your Tunnel

```bash
# Using ngrok (recommended)
npx ngrok http 3001

# Using localtunnel
npx localtunnel --port 3001

# Using cloudflared
cloudflared tunnel --url http://localhost:3001
```

### 2. Update Environment Variables

Update your `.env.local` with the tunnel URL:

```env
# Your tunnel URL (e.g., https://abc123.ngrok.io)
NEXT_PUBLIC_REDIRECT_URI=https://your-tunnel-url.ngrok.io/callback
NEXT_PUBLIC_RELOAD_APP_ID=your_client_id_here
RELOAD_CLIENT_SECRET=your_client_secret_here

# Optional server-side variables
REDIRECT_URI=https://your-tunnel-url.ngrok.io/callback
RELOAD_APP_ID=your_client_id_here

# Enable tunneling mode
NEXT_PUBLIC_USE_TUNNEL=true
```

### 3. Update Reload Developer Dashboard

Add your tunnel URL to the redirect URIs in your Reload Developer Dashboard:
- Add: `https://your-tunnel-url.ngrok.io/callback`
- Make sure it matches exactly what you have in `NEXT_PUBLIC_REDIRECT_URI`

### 4. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 5. Access Your App

Now access your app through the tunnel URL instead of localhost:
- **Tunnel URL**: `https://your-tunnel-url.ngrok.io`
- **Don't use**: `http://localhost:3001`

### Troubleshooting SSL Errors

If you encounter SSL protocol errors:

1. **Clear browser cache** and try again
2. **Use incognito/private browsing** mode
3. **Accept SSL certificate warnings** in your browser
4. **Try a different tunneling service** if one doesn't work
5. **Check that you're using HTTPS** for the tunnel URL

### Recommended Tunneling Services

- **ngrok**: Most reliable, good free tier
- **localtunnel**: Simple setup, no account required
- **cloudflared**: Fast, good for development

## OAuth Flow Overview

The application demonstrates the complete OAuth 2.0 flow with PKCE:

1. **Authorization Request**: User clicks "Connect Wallet" and is redirected to Reload
2. **User Authorization**: User logs in and grants permissions on Reload's platform
3. **Callback Handling**: User is redirected back with an authorization code
4. **Token Exchange**: Backend exchanges the code for access tokens
5. **API Access**: Application can now make authenticated API calls

## API Endpoints

The sample app includes the following API endpoints:

### OAuth Endpoints
- `POST /api/oauth/callback` - Exchange authorization code for tokens
- `POST /api/oauth/refresh` - Refresh expired tokens

### Wallet Endpoints (Require Wallet Token)
- `GET /api/wallet/transactions` - Get wallet transaction history
- `GET /api/wallet/transactions/[id]` - Get specific transaction details
- `POST /api/wallet/charge` - Charge user's wallet
- `POST /api/wallet/preview-charge` - Preview a charge before executing
- `POST /api/wallet/refund` - Refund a transaction

### Platform Endpoints (Require Client Credentials)
- `GET /api/platform/transactions` - Get platform transaction history

## Authentication Methods

The application uses two different authentication methods depending on the API endpoint:

### Wallet API Authentication
- **Method**: Bearer token (wallet token) + Client credentials
- **Headers**: 
  - `Authorization: Bearer <wallet_token>`
  - `X-Client-ID: <client_id>`
  - `X-Client-Secret: <client_secret>`
- **Used for**: Wallet-specific operations (transactions, charges, refunds)

### Platform API Authentication
- **Method**: Client credentials flow (OAuth 2.0)
- **Process**: 
  1. Exchange client credentials for access token
  2. Use access token in Authorization header
- **Headers**: `Authorization: Bearer <access_token>`
- **Used for**: Platform-level operations (all platform transactions)

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── oauth/             # OAuth endpoints
│   │   │   ├── callback/      # Token exchange
│   │   │   ├── refresh/       # Token refresh
│   │   │   └── revoke/        # Token revocation
│   │   ├── wallet/            # Wallet API endpoints
│   │   │   ├── transactions/  # Wallet transactions
│   │   │   ├── charge/        # Wallet charging
│   │   │   ├── preview-charge/ # Charge preview
│   │   │   └── refund/        # Transaction refunds
│   │   └── platform/          # Platform API endpoints
│   │       └── transactions/  # Platform transactions
│   ├── callback/              # OAuth callback page
│   ├── components/            # React components
│   │   ├── ChargeTab.js       # Wallet charging interface
│   │   ├── PreviewChargeTab.js # Charge preview interface
│   │   ├── WalletTransactionsTab.js # Wallet transactions
│   │   ├── PlatformTransactionsTab.js # Platform transactions
│   │   ├── SpecificTransactionTab.js # Individual transaction
│   │   └── ResponseDisplay.js # API response display
│   └── constants/             # Configuration constants
├── lib/                       # Utility functions
└── ...
```

## Key Components

- **Home Page** (`app/page.js`): Main interface with wallet connection and API testing
- **Callback Page** (`app/callback/page.js`): Handles OAuth callback and token exchange
- **API Routes**: Backend endpoints for OAuth and Reload API integration
- **UI Components**: Reusable components for different API operations

## Environment Variables

| Variable | Description | Required | Client/Server | Notes |
|----------|-------------|----------|---------------|-------|
| `NEXT_PUBLIC_RELOAD_APP_ID` | Your Reload application client ID | Yes | Client | Used in OAuth flow |
| `RELOAD_CLIENT_SECRET` | Your Reload application client secret | Yes | Server | Used in API calls |
| `NEXT_PUBLIC_REDIRECT_URI` | Your OAuth callback URL | Yes | Client | Used in OAuth flow |
| `RELOAD_APP_ID` | Your Reload application client ID | No | Server | Falls back to `NEXT_PUBLIC_RELOAD_APP_ID` |
| `REDIRECT_URI` | Your OAuth callback URL | No | Server | Falls back to `NEXT_PUBLIC_REDIRECT_URI` |

## Security Notes

- Never commit your `.env.local` file to version control
- The sample app uses PKCE (Proof Key for Code Exchange) for enhanced security
- Tokens are stored in localStorage for demo purposes - use secure storage in production
- Implement proper error handling and token refresh logic in production
- Client-side variables (prefixed with `NEXT_PUBLIC_`) are exposed to the browser
- Server-side variables are only accessible in API routes and server-side code
- Platform API calls use client credentials flow for enhanced security

## Troubleshooting

### Common Issues

1. **"Invalid redirect_uri" error**: Ensure your redirect URI is registered in the Reload Developer Dashboard
2. **"Invalid client_id" error**: Verify your `NEXT_PUBLIC_RELOAD_APP_ID` is correct
3. **"Failed to exchange code" error**: Check your `RELOAD_CLIENT_SECRET` and PKCE implementation
4. **"Missing client_id" error**: Make sure you're using `NEXT_PUBLIC_RELOAD_APP_ID` (not `RELOAD_APP_ID`)
5. **"Environment variable not found" error**: Ensure all required environment variables are set in `.env.local`
6. **Tunnel URL issues**: Make sure your tunnel URL is exactly the same in both environment variables and Reload Developer Dashboard
7. **"Amount and description are required" error**: Ensure the frontend is sending both amount and description in the correct format
8. **"Unexpected token '<'" error**: Usually indicates an HTML error page instead of JSON response - check authentication

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment.

## API Usage Examples

### Wallet Operations
```javascript
// Get wallet transactions
const response = await fetch('/api/wallet/transactions?limit=10&offset=0', {
  headers: { Authorization: 'Bearer <wallet_token>' }
});

// Charge wallet
const response = await fetch('/api/wallet/charge', {
  method: 'POST',
  headers: { Authorization: 'Bearer <wallet_token>' },
  body: JSON.stringify({
    amount: 10.00,
    amount_type: 'usd',
    usage_details: { description: 'Test charge' }
  })
});
```

### Platform Operations
```javascript
// Get platform transactions
const response = await fetch('/api/platform/transactions?page=1&limit=10');
```

## Learn More

- [Reload API Documentation](https://docs.withreload.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OAuth 2.0 with PKCE](https://oauth.net/2/pkce/)

## Support

For questions about this sample app or Reload integration, please contact our support team or refer to the [Reload documentation](https://docs.withreload.com/).

## License

This project is licensed under the MIT License.
