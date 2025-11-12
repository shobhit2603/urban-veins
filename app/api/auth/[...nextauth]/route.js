// This is the catch-all API route for Next-Auth.
// All requests to /api/auth/* (like /api/auth/signin, /api/auth/signout, etc.)
// will be handled by our auth.js configuration.

import { handlers } from "@/auth"; // We import our main auth.js config
export const { GET, POST } = handlers;