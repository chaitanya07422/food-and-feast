import { API_BASE_URL } from "./site";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the API. Start it with: cd food-and-feast/backend && npm run start:dev",
    );
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(", ");
      else if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/admin/uploads/image`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
    } catch {
      throw new ApiError(
        0,
        "Cannot reach the API. Start the backend, then try again.",
      );
    }
    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = (await res.json()) as { message?: string | string[] };
        if (Array.isArray(body.message)) message = body.message.join(", ");
        else if (body.message) message = body.message;
      } catch {
        /* ignore */
      }
      throw new ApiError(res.status, message);
    }
    return res.json() as Promise<{
      url: string;
      filename: string;
      mimeType: string;
      size: number;
    }>;
  },
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
};

export type MenuItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  categoryId:
    | string
    | { _id: string; name: string; slug: string };
  imageUrl?: string;
  imageAlt?: string;
  foodType: "vegetarian" | "non_vegetarian" | "unspecified";
  isFeatured: boolean;
  isAvailable: boolean;
  status: "draft" | "published";
  displayOrder: number;
  updatedAt?: string;
};

export type RestaurantSettings = {
  _id?: string;
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  openingHours?: Array<{
    day: string;
    open?: string;
    close?: string;
    closed?: boolean;
  }>;
  socialLinks?: Array<{ platform: string; url: string }>;
};

export function formatInr(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function categoryName(item: MenuItem) {
  if (typeof item.categoryId === "object" && item.categoryId) {
    return item.categoryId.name;
  }
  return "—";
}
