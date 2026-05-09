"use client";
import React from "react";
import { MdKeyboardBackspace } from "react-icons/md";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  const back = () => router.back();
  return (
    <button
      type="button"
      className="flex flex-row gap-2 items-center text-[14px] font-bold py-2 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 active:scale-95 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm"
      onClick={back}
    >
    <MdKeyboardBackspace size={20} className="group-hover:-translate-x-1 transition-transform"/>
      <span>
        Back
      </span>
    </button>
  );
};

export default BackButton;
