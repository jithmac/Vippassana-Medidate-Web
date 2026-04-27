import { prisma } from "./prisma";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.log(`[SMS SIMULATION] To: ${to} | Message: ${message}`);
      await prisma.smsLog.create({
        data: { phone: to, message, status: "SIMULATED" },
      });
      return true;
    }

    const twilio = require("twilio");
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to,
    });

    await prisma.smsLog.create({
      data: { phone: to, message, status: "SENT" },
    });

    return true;
  } catch (error) {
    console.error("SMS sending failed:", error);
    await prisma.smsLog.create({
      data: { phone: to, message, status: "FAILED" },
    });
    return false;
  }
}

export function buildSubmissionSMS(): string {
  return "Your application has been received and is currently under review by the Dhamma team. May you be peaceful and happy. 🙏";
}

export function buildApprovalSMS(teacherName: string, centerName: string, date: string, items: string): string {
  return `Your application is approved by ${teacherName}. Please arrive at ${centerName} on ${date}. Bring: ${items}. May all beings be happy. 🙏`;
}
