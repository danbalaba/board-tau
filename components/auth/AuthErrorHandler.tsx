"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthErrorHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl");

    console.log("AuthErrorHandler - Error:", error);

    if (error && error.trim()) {
      let errorMessage = "An error occurred during authentication";

      if (error === "OAuthAccountNotLinked") {
        errorMessage =
          "An account with this email already exists. Please log in using your existing account type or use a different email.";
      } else if (error === "CredentialsSignin") {
        errorMessage = "Invalid email or password";
      } else if (error === "OAuthCreateAccount") {
        errorMessage = "Failed to create account. Please try again.";
      } else if (error === "Callback") {
        // This is a generic error - don't show anything
        return;
      } else {
        errorMessage = `Authentication error: ${error}`;
      }

      toast.error(errorMessage);

      // Redirect to remove error from URL
      const targetUrl = callbackUrl || "/";
      router.replace(targetUrl);
    }
  }, [searchParams, router]);

  return null;
};

export default AuthErrorHandler;
