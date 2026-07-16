import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthModal from "../AuthModal";
import { signIn } from "next-auth/react";
import { registerUser } from "@/services/auth";
import { sendOTP, verifyOTP } from "@/services/user/otp";
import { useResponsiveToast } from "../../common/ResponsiveToast";
import { useRouter } from "next/navigation";

// Mock dependencies
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("@/services/auth", () => ({
  registerUser: jest.fn(),
}));

jest.mock("@/services/user/otp", () => ({
  sendOTP: jest.fn(),
  verifyOTP: jest.fn(),
}));

jest.mock("../../common/ResponsiveToast", () => ({
  useResponsiveToast: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("AuthModal", () => {
  const mockToast = {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  };

  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsiveToast as jest.Mock).mockReturnValue(mockToast);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Suppress console errors for clean test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("Login Flow", () => {
    it("renders login form by default if name is Login", () => {
      render(<AuthModal name="Login" />);
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Full Name/i)).not.toBeInTheDocument();
    });

    it("handles successful login", async () => {
      (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({ user: { role: "user" } })
      });

      render(<AuthModal name="Login" onCloseModal={jest.fn()} />);

      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "Str0ngP@ssw0rd!" } });

      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Continue" }));
      });

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          email: "test@example.com",
          password: "Str0ngP@ssw0rd!",
          redirect: false,
        });
        expect(mockToast.success).toHaveBeenCalledWith("You've successfully logged in.", expect.any(Object));
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it("handles unverified email login by switching to OTP", async () => {
      (signIn as jest.Mock).mockResolvedValue({ error: "Email not verified" });

      render(<AuthModal name="Login" />);

      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "Str0ngP@ssw0rd!" } });

      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Continue" }));
      });

      await waitFor(() => {
        expect(screen.getByText("Verify Email")).toBeInTheDocument();
        expect(mockToast.error).toHaveBeenCalledWith("Please verify your email first");
      });
    });

    it("handles login error", async () => {
      (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });

      render(<AuthModal name="Login" />);

      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "Str0ngP@ssw0rd!" } });

      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Continue" }));
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Invalid credentials");
      });
    });

    it("calls onCloseModal when forgot password is clicked", () => {
      const handleClose = jest.fn();
      render(<AuthModal name="Login" onCloseModal={handleClose} />);
      const forgotPwd = screen.getByText("Forgot password?");
      fireEvent.click(forgotPwd);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Signup Flow", () => {
    it("renders signup form by default if name is Sign up", () => {
      render(<AuthModal name="Sign up" />);
      expect(screen.getByText("Create an account!")).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });

    it("toggles between login and signup", () => {
      render(<AuthModal name="Login" />);
      const toggleBtn = screen.getByText("Create an account");
      fireEvent.click(toggleBtn);
      
      expect(screen.getByText("Create an account!")).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();

      const loginToggleBtn = screen.getByText("Log in");
      fireEvent.click(loginToggleBtn);

      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(screen.queryByLabelText(/Full Name/i)).not.toBeInTheDocument();
    });

    it("handles successful signup and switches to OTP", async () => {
      (registerUser as jest.Mock).mockResolvedValue({ success: true });

      render(<AuthModal name="Sign up" />);

      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "John Doe" } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "Str0ngP@ssw0rd!" } });

      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Continue" }));
      });

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalled();
        expect(screen.getByText("Verify Email")).toBeInTheDocument();
        expect(mockToast.success).toHaveBeenCalledWith("OTP sent to your email!");
      });
    });
  });

  describe("OTP Flow", () => {
    beforeEach(() => {
      // Force the modal into OTP state by simulating a successful signup
      (registerUser as jest.Mock).mockResolvedValue({ success: true });
    });

    const setupOTPState = async () => {
      render(<AuthModal name="Sign up" />);
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "John Doe" } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "Str0ngP@ssw0rd!" } });
      
      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Continue" }));
      });

      await waitFor(() => {
        expect(screen.getByText("Verify Email")).toBeInTheDocument();
      });
    };

    it("handles successful OTP verification", async () => {
      await setupOTPState();
      (verifyOTP as jest.Mock).mockResolvedValue({ success: true });

      // Find the hidden input that react-hook-form binds to for the OTP
      const otpInputs = screen.getAllByRole("textbox");
      fireEvent.change(otpInputs[0], { target: { value: "1" } });
      fireEvent.change(otpInputs[1], { target: { value: "2" } });
      fireEvent.change(otpInputs[2], { target: { value: "3" } });
      fireEvent.change(otpInputs[3], { target: { value: "4" } });
      fireEvent.change(otpInputs[4], { target: { value: "5" } });
      fireEvent.change(otpInputs[5], { target: { value: "6" } });
      
      // Submit the form
      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Verify Identity" }));
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith("Email verified successfully!");
        expect(screen.getByText("Welcome back")).toBeInTheDocument(); // Switches back to login
      });
    });

    it("handles invalid OTP", async () => {
      await setupOTPState();
      (verifyOTP as jest.Mock).mockResolvedValue({ error: "Invalid OTP" });

      const otpInputs = screen.getAllByRole("textbox");
      fireEvent.change(otpInputs[0], { target: { value: "1" } });
      fireEvent.change(otpInputs[1], { target: { value: "2" } });
      fireEvent.change(otpInputs[2], { target: { value: "3" } });
      fireEvent.change(otpInputs[3], { target: { value: "4" } });
      fireEvent.change(otpInputs[4], { target: { value: "5" } });
      fireEvent.change(otpInputs[5], { target: { value: "6" } });

      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Verify Identity" }));
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Invalid OTP");
      });
    });

    it("handles OTP lockout countdown", async () => {
      jest.useFakeTimers();
      await setupOTPState();
      (verifyOTP as jest.Mock).mockRejectedValue(new Error("Please try again in 3 second(s)"));

      const otpInputs = screen.getAllByRole("textbox");
      fireEvent.change(otpInputs[0], { target: { value: "1" } });
      fireEvent.change(otpInputs[1], { target: { value: "2" } });
      fireEvent.change(otpInputs[2], { target: { value: "3" } });
      fireEvent.change(otpInputs[3], { target: { value: "4" } });
      fireEvent.change(otpInputs[4], { target: { value: "5" } });
      fireEvent.change(otpInputs[5], { target: { value: "6" } });

      await act(async () => {
        fireEvent.submit(screen.getByRole("button", { name: "Verify Identity" }));
      });

      await waitFor(() => {
        expect(screen.getByText("Security Lockout: 3 seconds remaining")).toBeInTheDocument();
      });

      // Advance timer by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByText(/Security Lockout/)).not.toBeInTheDocument();
      });
      jest.useRealTimers();
    });

    it("handles resend cooldown tick", async () => {
      jest.useFakeTimers();
      await setupOTPState();
      
      // Mock sendOTP to simulate a rate-limit error that triggers the cooldown
      (sendOTP as jest.Mock).mockRejectedValue(new Error("Please wait 60 seconds before requesting a new OTP."));

      // Find and click "Resend Code"
      const resendBtn = screen.getByText(/Didn't get it\? Resend/i);
      
      await act(async () => {
        fireEvent.click(resendBtn);
      });

      // The button should now say something like "New code in 60s"
      await waitFor(() => {
        expect(screen.getByText(/New code in \d+s/i)).toBeInTheDocument();
      });

      // Advance timer by 1 second to cover the interval tick (lines 247-248)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // It should now be 59s
      expect(screen.getByText(/New code in 59s/i)).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe("OAuth Providers", () => {
    it("handles Google OAuth", () => {
      render(<AuthModal name="Login" />);
      const googleBtn = screen.getByText("Continue with Google");
      fireEvent.click(googleBtn);
      
      expect(signIn).toHaveBeenCalledWith("google", expect.any(Object));
    });

    it("handles Facebook OAuth", () => {
      render(<AuthModal name="Login" />);
      const facebookBtn = screen.getByText("Continue with Facebook");
      fireEvent.click(facebookBtn);
      
      expect(signIn).toHaveBeenCalledWith("facebook", expect.any(Object));
    });
  });
});
