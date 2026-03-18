"use client";

import React from "react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import Button from "@/components/common/Button";

const TestToastPage: React.FC = () => {
  const { success, error, warning, info, loading } = useResponsiveToast();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Responsive Toast Test</h1>
        <p className="text-gray-600">
          Test different toast variants. On mobile (≤768px) you'll see Sileo toasts, on desktop you'll see the existing toasts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl">
        <Button onClick={() => success("Success message")}>
          Success
        </Button>

        <Button onClick={() => error({
          title: "Error message",
          description: "Please try again later"
        })} variant="danger">
          Error
        </Button>

        <Button onClick={() => warning({
          title: "Warning message",
          description: "This is a warning description"
        })}>
          Warning
        </Button>

        <Button onClick={() => info({
          title: "Info message",
          description: "Additional information"
        })}>
          Info
        </Button>

        <Button onClick={() => loading("Loading message")} variant="secondary">
          Loading
        </Button>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">How it works:</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-green-500 font-bold mt-1">✓</span>
            <span>On mobile devices (≤768px), Sileo toasts appear at the bottom</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold mt-1">✓</span>
            <span>On desktop devices (&gt;768px), existing react-hot-toast appear at the top-right</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-500 font-bold mt-1">✓</span>
            <span>Sileo toasts are more compact and mobile-friendly</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TestToastPage;
