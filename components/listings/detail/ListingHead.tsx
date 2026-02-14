import React from "react";
import Image from "@/components/common/Image";

import Heading from "@/components/common/Heading";
import HeartButton from "@/components/favorites/HeartButton";
import { getFavorites } from "@/services/user/favorites";

interface ListingHeadProps {
  title: string;
  country: string | null;
  region: string | null;
  image: string;
  id: string;
}

const ListingHead: React.FC<ListingHeadProps> = async ({
  title,
  country = "",
  region = "",
  image,
  id,
}) => {
  const favorites = await getFavorites();
  const hasFavorited = favorites.includes(id);

  return (
    <>
      <Heading title={title} subtitle={`${region}, ${country}`} backBtn/>
      <div
        className={`w-full md:h-[420px] sm:h-[280px] bg-gray-100 h-[260px] overflow-hidden  rounded-xl relative transition duration-300`}
      >
        <Image imageSrc={image} fill className={`object-cover`} alt={title} sizes="100vw" />
        <div className="absolute top-5 right-5">
          <HeartButton listingId={id} hasFavorited={hasFavorited} />
        </div>
      </div>
    </>
  );
};

export default ListingHead;
