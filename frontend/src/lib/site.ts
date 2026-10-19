/**
 * Fallback display copy. Live contact details come from /restaurant/settings
 * after seeding from the owner-supplied menu PDF.
 */
export const SITE = {
  name: "Food & Feast",
  tagline: "One Place. Endless Flavours",
  descriptionPlaceholder:
    "Multicuisine restaurant serving Indian, Chinese, Tandoori and Kshatriya specialities.",
  /**
   * Google Maps place for Food and Feast Multicuisine Restaurant
   * (17.6829711, 83.2057678 — Old Gajuwaka).
   */
  directionsUrl:
    "https://www.google.com/maps/place/Food+and+Feast+Multicuisine+Restaurant/@17.6829711,83.2057678,17z",
  /** Embed query pinned to the restaurant place (not nearby landmarks). */
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Food+and+Feast+Multicuisine+Restaurant,+Gajuwaka&ll=17.6829711,83.2057678&z=17&output=embed",
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
