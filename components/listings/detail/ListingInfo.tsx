"use client";

import React from "react";
import dynamic from "next/dynamic";

import Avatar from "@/components/Avatar";
import { AiOutlineCheck } from "react-icons/ai";

interface ListingInfoProps {
  user: {
    image: string | null;
    name: string | null;
  };
  description: string;
  guestCount: number;
  roomCount: number;
  bathroomCount: number;
  category: { label: string; description?: string } | null | undefined;
  latlng: number[];
  amenities: string[];
  roomType: string;
}

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

const ListingInfo: React.FC<ListingInfoProps> = ({
  user,
  description,
  guestCount,
  roomCount,
  bathroomCount,
  category,
  latlng,
  amenities,
  roomType,
}) => {
  return (
    <div className="col-span-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="text-[16px] font-semibold flex flex-row items-center gap-2">
          <span className="mr-1">Hosted by</span> <Avatar src={user?.image} />
          <span> {user?.name}</span>
        </div>
        <div
          className="flex flex-row items-center gap-4 font-light text-neutral-700 dark:text-gray-300
          "
        >
          <span>{guestCount} guests</span>
          <span>{roomCount} rooms</span>
          <span>{bathroomCount} bathrooms</span>
        </div>
      </div>
      <hr />
      {category && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center gap-4">
            <div className="text-neutral-600">📋</div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{category.label}</span>
              <p className="text-neutral-500 dark:text-gray-400 font-light">{category.description || ""}</p>
            </div>
          </div>
        </div>
      )}
      <hr />
      <p className="font-light text-neutral-500 dark:text-gray-400 text-[16px] ">{description}</p>
      <hr />
      <div className="flex flex-col gap-2">
        <h3 className="text-[16px] font-semibold text-gray-800 dark:text-gray-100">Amenities</h3>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <AiOutlineCheck size={18} />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-2">
        <h3 className="text-[16px] font-semibold">Room Type</h3>
        <p className="font-light text-neutral-500 text-[16px]">{roomType}</p>
      </div>
      <hr />
      <div className="h-[210px]">
        <Map center={latlng} />
      </div>
    </div>
  );
};

export default ListingInfo;
