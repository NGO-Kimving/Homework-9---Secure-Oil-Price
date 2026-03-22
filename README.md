# Express Middleware Security Assignment

This project is an Express.js server secured with a multi-layered middleware stack. It demonstrates practical API security concepts including IP filtering, CORS restriction, rate limiting, and dual-mode authentication (Bearer Token and Basic Auth).

## Prerequisites
* Node.js installed on your machine.

## Installation and Setup

1. **Clone the repository** (if you haven't already):
   \`\`\`bash
   git clone <your-repository-url>
   cd express-middleware-assignment
   \`\`\`

2. **Install the dependencies**:
   This project requires `express`, `cors`, and `express-rate-limit`. Install them by running:
   \`\`\`bash
   npm install
   \`\`\`

## Running the Server

Start the application by running the following command in your terminal:

\`\`\`bash
node app.js
\`\`\`
*(Alternatively, you can use `npm start` if it is configured in your package.json).*

The server will start and listen on port 3000. 
**Important:** Due to strict IP filtering rules, you must access the server using the `127.0.0.1` loopback address, not `localhost`.

* **Base URL:** `http://127.0.0.1:3000`

## Instructor Testing Credentials

To test the security layers and evaluate the rubric, please use the following credentials:

### 1. API Endpoint (Bearer Token Authentication)
* **Endpoint:** `GET /api/oil-prices`
* **Protection:** Requires a valid Bearer Token in the authorization header.
* **Token:** `supersecrettoken123`
* **Test via cURL:**
  \`\`\`bash
  curl -H "Authorization: Bearer supersecrettoken123" http://127.0.0.1:3000/api/oil-prices
  \`\`\`

### 2. Web Dashboard (Basic Authentication)
* **Endpoint:** `GET /dashboard`
* **Protection:** Requires a valid Username and Password via browser prompt.
* **Username:** `admin`
* **Password:** `password123`
* **Access:** Navigate to `http://127.0.0.1:3000/dashboard` in a web browser.

## Endpoints Overview

* `/` : Automatically redirects to the `/dashboard`.
* `/api/oil-prices` : Returns a static JSON object containing energy market data (Protected by Bearer Token).
* `/dashboard` : Serves a simple HTML interface displaying the energy data (Protected by Basic Auth).
* `/logout` : Clears the Basic Authentication session by forcing a 401 Unauthorized state, effectively logging the user out.

## Middleware Architecture

This server applies middleware in the following logical sequence to ensure maximum security:
1. **IP Filtering:** Rejects any request not originating from `127.0.0.1` or `::1` with a 403 status.
2. **CORS:** Restricts access strictly to local origins.
3. **Rate Limiting:** Throttles traffic to a maximum of 10 requests per 1-minute window to prevent abuse.
4. **Authentication:** Route-specific protection applying either Bearer or Basic auth depending on the endpoint.