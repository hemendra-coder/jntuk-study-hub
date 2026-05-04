import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

/**
 * Client middleware that attaches the current Supabase session's access token
 * as an Authorization: Bearer <token> header on the outbound server-function
 * request, so server-side `requireSupabaseAuth` can validate it.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      sendContext: {},
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
);
