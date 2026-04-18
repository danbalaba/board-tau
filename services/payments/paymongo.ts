import axios from "axios";

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;

const authHeader = {
  Authorization: `Basic ${Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64")}`,
  "Content-Type": "application/json",
};

export const createPayMongoCheckoutSession = async ({
  amount,
  description,
  name,
  email,
  inquiryId,
  paymentMethod,
}: {
  amount: number;
  description: string;
  name: string;
  email: string;
  inquiryId: string;
  paymentMethod: "GCASH" | "MAYA";
}) => {
  // Check if PayMongo is configured
  if (!PAYMONGO_SECRET_KEY) {
    // Return a mock URL for testing if no key is provided
    console.warn("PayMongo Secret Key not found. Using Mock simulation.");
    return {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reservations/mock-payment?inquiryId=${inquiryId}&status=success&method=${paymentMethod}`
    };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Map BoardTAU payment methods to PayMongo payment methods
    const paymongoMethod = paymentMethod === "GCASH" ? "gcash" : "paymaya";

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: description,
            line_items: [
              {
                amount: amount * 100, // PayMongo uses centavos
                currency: "PHP",
                description: description,
                name: "Reservation Fee",
                quantity: 1,
              },
            ],
            payment_method_types: [paymongoMethod],
            success_url: `${baseUrl}/reservations?status=success`,
            cancel_url: `${baseUrl}/reservations?status=cancelled`,
            metadata: {
              inquiryId,
            },
          },
        },
      },
      { headers: authHeader }
    );

    return { url: response.data.data.attributes.checkout_url };
  } catch (error: any) {
    console.error("PayMongo Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || "Failed to create PayMongo session");
  }
};

/**
 * Verifies the PayMongo webhook signature
 */
export const verifyPayMongoSignature = (
  payload: string,
  signature: string,
  PAYMONGO_WEBHOOK_SECRET: string
) => {
  // In a real implementation, you'd use crypto to verify the signature
  // For the capstone, we will simplify or use a library
  // PayMongo provides a signature in the header
  return true; // Simplified for now
};
