// Paste your OAuth "Web application" client id into .env as VITE_GOOGLE_CLIENT_ID.
// Without it the Google buttons simply stay hidden.
export const GOOGLE_CLIENT_ID: string = ((import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "").trim();
