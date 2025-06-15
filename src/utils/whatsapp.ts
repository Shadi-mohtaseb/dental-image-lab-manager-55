
/**
 * Helper to build WhatsApp Web link with text and phone.
 * Phone should be in international format without "+" (e.g., 9725XXXXXX)
 */
export function buildWhatsappLink(phone: string, message: string) {
  // Remove any non-digits, leading zeros, and plus signs
  let sanitized = phone.replace(/[^0-9]/g, "");
  if (sanitized.startsWith("00")) sanitized = sanitized.slice(2);
  if (sanitized.startsWith("0")) sanitized = "972" + sanitized.slice(1);
  // Fallback: use as-is if it looks like a valid long phone number
  const waNumber = sanitized;
  const waMsg = encodeURIComponent(message);
  return `https://wa.me/${waNumber}?text=${waMsg}`;
}
