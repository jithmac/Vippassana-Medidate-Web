import { parsePhoneNumberFromString, isValidPhoneNumber } from "libphonenumber-js";

/**
 * Validates a phone number based on its country.
 * @param phone E.164 formatted phone number (e.g. +94771234567)
 * @returns boolean
 */
export function validatePhone(phone: string): boolean {
  try {
    // If it doesn't start with +, libphonenumber might not parse it correctly for international
    if (!phone.startsWith("+")) return false;
    
    const phoneNumber = parsePhoneNumberFromString(phone);
    if (!phoneNumber) return false;
    
    return phoneNumber.isValid();
  } catch (error) {
    return false;
  }
}

/**
 * Formats a phone number to E.164
 * @param phone Any phone number string
 * @returns E.164 formatted string or original if invalid
 */
export function formatPhoneE164(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone);
    if (!phoneNumber) return phone;
    return phoneNumber.format("E.164");
  } catch {
    return phone;
  }
}
