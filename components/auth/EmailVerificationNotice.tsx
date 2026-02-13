"use client";

import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { sendOTP } from "@/services/user/otp";
import toast from "react-hot-toast";

const EmailVerificationNotice = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Only show notice to users with unverified emails
  if (status !== "authenticated" || session?.user.emailVerified) {
    return null;
  }

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      if (session?.user.email) {
        await sendOTP(session.user.email);
        toast.success("New OTP sent to your email!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center">
        <FaExclamationTriangle className="w-6 h-6 text-yellow-400 mr-3" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800">Email Verification Required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your email address is not verified. Please verify your email to access all features.
            </p>
            <div className="mt-3 flex items-center">
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-300 hover:bg-yellow-200 disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationNotice;
