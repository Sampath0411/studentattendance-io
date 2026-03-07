/**
 * Input sanitization utilities for XSS prevention.
 * Use these for any user-generated content rendered in the DOM.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/** Escape HTML entities to prevent XSS in dynamic content */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/** Strip all HTML tags from a string */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/** Sanitize a string for safe use as a URL parameter */
export function sanitizeUrlParam(str: string): string {
  return encodeURIComponent(str.trim());
}

/** Validate and sanitize a registration number */
export function sanitizeRegNumber(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

/** Validate mobile number (10 digits) */
export function isValidMobile(mobile: string): boolean {
  return /^\d{10}$/.test(mobile);
}
