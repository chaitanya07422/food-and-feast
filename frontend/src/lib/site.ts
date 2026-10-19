/**
 * Fallback display copy. Live contact details come from /restaurant/settings
 * after seeding from the owner-supplied menu PDF.
 */
export const SITE = {
  name: "Food & Feast",
  tagline: "One Place. Endless Flavours",
  descriptionPlaceholder:
    "Multicuisine restaurant serving Indian, Chinese, Tandoori and Kshatriya specialities.",
  /** Google Maps share link for “Get directions” CTAs */
  directionsUrl: "https://share.google/Z5zF57RUlzmFK6jPy",
  nav: [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Origin used for uploaded dish images (no /api/v1 suffix). */
export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000";
