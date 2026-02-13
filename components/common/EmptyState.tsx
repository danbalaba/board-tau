import React from "react";
import Heading from "./Heading";
import Link from "next/link";

interface EmptyProps {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
}

const EmptyState: React.FC<EmptyProps> = ({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters.",
  showReset,
}) => {
  return (
    <div className="h-[60vh] flex flex-col gap-2 justify-center items-center">
      <Heading center title={title} subtitle={subtitle} />
      <div className="w-48 mt-4">
        {showReset && (
          <Link
            href="/"
            className="block text-center bg-white dark:bg-gray-800 border-[1px] border-border dark:border-gray-700 text-text-primary dark:text-gray-100 rounded-input hover:shadow-soft transition-all py-3 font-medium"
          >
            Remove all filters
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
