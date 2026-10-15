import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Better Auth catch-all endpoint.
 * Better Auth handles /api/auth/sign-up/email, /api/auth/sign-in/email,
 * /api/auth/get-session, and the rest of its API under this route.
 */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
