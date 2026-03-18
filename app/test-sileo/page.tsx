"use client";

import React from "react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import Button from "@/components/common/Button";

const TestSileoPage: React.FC = () => {
  const { success, error, warning, info, loading } = useResponsiveToast();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sileo Toast Test</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test all Sileo toast features. This page is best viewed on mobile (≤768px).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Basic Toasts</h2>
          <Button onClick={() => success("Operation completed")}>
            Success
          </Button>
          <Button onClick={() => error({
            title: "Something went wrong",
            description: "Please try again later"
          })} variant="danger">
            Error
          </Button>
          <Button onClick={() => warning("Storage almost full")}>
            Warning
          </Button>
          <Button onClick={() => info("New update available")}>
            Info
          </Button>
          <Button onClick={() => loading("Loading data...")} variant="secondary">
            Loading
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Advanced Features</h2>
          <Button onClick={() => success({
            title: "Manual only",
            description: "Expand and collapse are disabled.",
            autopilot: false,
          })}>
            No Autopilot
          </Button>
          <Button onClick={() => success({
            title: "Custom timing",
            description: "Expand after 500ms, collapse after 3s.",
            autopilot: { expand: 500, collapse: 3000 },
          })}>
            Custom Autopilot
          </Button>
          <Button onClick={() => success({
            title: "Sharp corners",
            description: "With roundness set to 12.",
            roundness: 12,
          })}>
            Sharp Corners
          </Button>
          <Button onClick={() => success({
            title: "Fully round",
            description: "With roundness set to 24.",
            roundness: 24,
          })}>
            Fully Round
          </Button>
          <Button onClick={() => success({
            title: "Payment received",
            description: (
              <span className="text-green-500/50! font-medium!">
                We received your payment of $49.00.
              </span>
            ),
          })}>
            Custom Description
          </Button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Sileo Features:</h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start space-x-2">
            <span className="text-green-500 font-bold mt-1">✓</span>
            <span>Adapts to dark mode</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 font-bold mt-1">✓</span>
            <span>Top-center position</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-500 font-bold mt-1">✓</span>
            <span>Custom autopilot timing</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-500 font-bold mt-1">✓</span>
            <span>Custom roundness</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-red-500 font-bold mt-1">✓</span>
            <span>Custom descriptions with JSX</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-500 font-bold mt-1">✓</span>
            <span>Physics-based animations</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TestSileoPage;
