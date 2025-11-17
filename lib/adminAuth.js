// This is the code for lib/adminAuth.js

import { auth } from '@/auth';

/**
 * A reusable server-side function to check if the current user
 * is authenticated and has the 'admin' role.
 * * @returns {Promise<{user: object, error?: undefined, status?: undefined} | {user?: undefined, error: string, status: number}>}
 * On success, returns the user object.
 * On failure, returns an error message and HTTP status code.
 */
export async function checkAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  if (session.user.role !== 'admin') {
    return { error: 'Forbidden: You do not have admin privileges.', status: 403 };
  }

  // All checks passed
  return { user: session.user };
}