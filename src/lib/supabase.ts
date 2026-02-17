export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string | null;
  };
};

const storageKey = "fitsutra.session";

export function getSession(): SupabaseSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    return null;
  }
}

export function setSession(session: SupabaseSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(storageKey);
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export async function signInWithPassword(email: string, password: string) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error_description ?? "Sign in failed");
  }

  const session = (await response.json()) as SupabaseSession;
  setSession(session);
  return session;
}

export async function signUp(email: string, password: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error_description ?? "Sign up failed");
  }

  const session = (await response.json()) as SupabaseSession;
  if (session?.access_token) {
    setSession(session);
  }
  return session;
}

export async function signOut() {
  setSession(null);
}

export async function supabaseFetch<T>(
  path: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Supabase request failed");
  }

  return (await response.json()) as T;
}

export async function supabaseInsert<T>(
  path: string,
  accessToken: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Supabase insert failed");
  }

  return (await response.json()) as T;
}

export async function createGymWorkspace(
  accessToken: string,
  userId: string,
  gymName: string,
  city: string,
  state: string
) {
  const [gym] = await supabaseInsert<
    Array<{ id: string; name: string }>
  >("gyms", accessToken, [
    {
      name: gymName,
      city,
      state,
      owner_id: userId,
    },
  ]);

  await supabaseInsert("profiles", accessToken, [
    {
      user_id: userId,
      gym_id: gym.id,
      role: "owner",
    },
  ]);

  return gym;
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
