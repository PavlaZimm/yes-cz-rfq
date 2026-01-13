const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

export interface MakeWebhookPayload {
  event: string;
  data: Record<string, any>;
}

/**
 * Sends a webhook to Make.com
 */
export async function triggerMakeWebhook(
  event: string,
  data: Record<string, any>
): Promise<boolean> {
  if (!MAKE_WEBHOOK_URL) {
    console.warn('Make.com webhook URL not configured');
    return false;
  }

  try {
    const payload: MakeWebhookPayload = {
      event,
      data,
    };

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Make.com webhook failed:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error triggering Make.com webhook:', error);
    return false;
  }
}

/**
 * Generates a unique magic link token
 */
export function generateMagicLinkToken(): string {
  return crypto.randomUUID();
}

/**
 * Calculates expiration date (default 7 days from now)
 */
export function calculateExpirationDate(days: number = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
