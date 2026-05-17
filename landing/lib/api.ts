import { getApiUrl } from "@/lib/env"

export class ApiError extends Error {
  status: number
  data: Record<string, unknown>

  constructor(status: number, data: Record<string, unknown>) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.non_field_errors)
          ? String(data.non_field_errors[0])
          : `Request failed (${status})`
    super(detail)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok) {
    throw new ApiError(res.status, data)
  }

  return data as T
}

export const fetchData = <T,>(path: string) => request<T>(path, { method: "GET" })

export const postData = <T,>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  })

export const loginUser = (email: string, password: string) =>
  postData<{ user?: unknown }>("/user/login/", { email, password })

export const registerUser = (payload: { name: string; email: string; password: string }) =>
  postData<{ requires_otp?: boolean }>("/user/register/", payload)

export function fieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError)) return undefined
  const value = error.data[field]
  if (Array.isArray(value) && typeof value[0] === "string") return value[0]
  if (typeof value === "string") return value
  return undefined
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message
  return fallback
}
