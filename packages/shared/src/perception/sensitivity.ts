import { Sensitivity } from "../schemas/snapshot.js";

export function classifySensitivity(
  element: Element,
  accessibleName: string,
  type: string
): Sensitivity {
  const normType = (type || "").toLowerCase();
  const normName = (accessibleName || "").toLowerCase();
  const id = (element.id || "").toLowerCase();
  const name = (element.getAttribute("name") || "").toLowerCase();
  const autocomplete = (element.getAttribute("autocomplete") || "").toLowerCase();

  if (normType === "password" || autocomplete.includes("password")) {
    return "password";
  }

  const combined = `${id} ${name} ${normName} ${autocomplete}`;

  if (/\b(otp|one[-\s]?time|mfa|2fa|verification[-\s]?code)\b/.test(combined)) {
    return "otp";
  }

  if (/\b(pin|security[-\s]?pin|secret)\b/.test(combined)) {
    return "otp";
  }

  if (/\b(aadhaar|national[-\s]?id|ssn|social[-\s]?security|pan[-\s]?card|voter[-\s]?id)\b/.test(combined)) {
    return "national_id";
  }

  if (/\b(card[-\s]?number|cvv|cvc|credit[-\s]?card|debit[-\s]?card)\b/.test(combined)) {
    return "payment_card";
  }

  if (/\b(account[-\s]?number|bank[-\s]?account|ifsc|routing|iban)\b/.test(combined)) {
    return "bank_account";
  }

  if (normType === "date" || /\b(dob|birth[-\s]?date|date[-\s]?of[-\s]?birth)\b/.test(combined)) {
    return "date_of_birth";
  }

  if (normType === "tel" || normType === "email" || /\b(phone|mobile|cell|telephone|email)\b/.test(combined)) {
    return "contact";
  }

  return "none";
}
