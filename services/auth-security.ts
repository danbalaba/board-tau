'use server';

import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { sendNewLoginEmail } from "@/services/email/notifications";

/**
 * Handles the security alert for a new login attempt.
 * Detects device/browser and sends the notification email.
 */
export const triggerLoginSecurityAlert = async (user: { email: string; name?: string | null }) => {
  if (!user.email) return;

  try {
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    
    const browserName = parser.getBrowser().name || 'Unknown Browser';
    const osName = parser.getOS().name || 'Unknown OS';
    const deviceModel = parser.getDevice().model || '';
    
    const browser = `${browserName} (${osName})`;
    const device = deviceModel || 'Desktop/Laptop';

    await sendNewLoginEmail({
      email: user.email,
      name: user.name,
    }, {
      browser,
      device,
      time: new Date().toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })
    });
  } catch (error) {
    console.error("🔐 Failed to send login alert email:", error);
  }
};
