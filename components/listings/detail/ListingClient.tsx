"use client";
import React, {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { User } from "next-auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import InquiryModal from "@/components/modals/InquiryModal";
import Modal from "@/components/modals/Modal";
import Button from "@/components/common/Button";

interface ListingClientProps {
  reservations?: {
    startDate: Date;
    endDate: Date;
  }[];
  children: ReactNode;
  id: string;
  title: string;
  price: number;
  user:
    | (User & {
        id: string;
      })
    | undefined;
  rooms: any[];
}

const ListingClient: React.FC<ListingClientProps> = ({
  price,
  reservations = [],
  children,
  user,
  id,
  title,
  rooms,
}) => {
  const [isLoading, startTransition] = useTransition();
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const router = useRouter();

  const handleInquiry = async (data: any) => {
    if (!user) {
      toast.error("Please log in to send an inquiry.");
      return;
    }

    startTransition(async () => {
      try {
        // TODO: Implement API call to create inquiry
        console.log("Inquiry data:", {
          ...data,
          listingId: id,
          userId: user.id,
        });

        toast.success("Inquiry sent! Waiting for owner approval.");
      } catch (error: any) {
        console.error('Inquiry error:', error);
        toast.error(error?.message || 'Failed to send inquiry');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
      {children}

      <div className="order-first mb-10 md:order-last md:col-span-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border-[1px] border-neutral-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="flex flex-row items-center gap-1 p-4">
            <span className="text-lg font-semibold text-text-primary dark:text-gray-100">₱ {price.toLocaleString()}</span>
            <span className="font-light text-neutral-600 dark:text-gray-400">per month</span>
          </div>
          <hr className="border-neutral-200 dark:border-gray-700" />

          {/* Inquiry Button */}
          <div className="p-4">
            <Modal.Trigger name="inquiry">
              <Button
                disabled={isLoading}
                className="flex flex-row items-center justify-center h-[42px] "
                size="large"
              >
                Inquire Now
              </Button>
            </Modal.Trigger>
          </div>
        </div>

        <InquiryModal
          listingName={title}
          rooms={rooms}
          onSubmit={handleInquiry}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ListingClient;
