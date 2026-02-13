"use client";
import React, { FC } from "react";
import { Listing } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";

import ListingCard, { ListingSkeleton } from "./ListingCard";
import { useLoadMore } from "@/hooks/useLoadMore";

interface LoadMoreProps {
  nextCursor: string;
  fnArgs?: { [key: string]: string | undefined };
  queryKey: any[];
  favorites: string[];
  queryFn?: any;
}

const LoadMore: FC<LoadMoreProps> = ({
  nextCursor,
  fnArgs,
  queryKey,
  favorites,
}) => {
  // Create a fetch function that calls the API
  const fetchListings = async ({ pageParam = nextCursor }) => {
    const params = new URLSearchParams();
    params.set("cursor", pageParam);

    if (fnArgs) {
      Object.entries(fnArgs).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });
    }

    const response = await fetch(`/api/listings?${params.toString()}`);
    const data = await response.json();

    return {
      listings: data.listings,
      nextCursor: data.nextCursor,
    };
  };

  const { data, isFetchingNextPage, hasNextPage, status, fetchNextPage } =
    useInfiniteQuery({
      queryFn: fetchListings,
      queryKey,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      initialPageParam: nextCursor,
    });

  const { ref } = useLoadMore(
    fetchNextPage,
    hasNextPage,
    status === "pending" || isFetchingNextPage,
    status === "error"
  );

  return (
    <>
      {data?.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group?.listings?.map(
            (
              listing: Listing & {
                reservation?: {
                  id: string;
                  startDate: Date;
                  endDate: Date;
                  totalPrice: number;
                };
              }
            ) => {
              const hasFavorited = favorites.includes(listing.id);
              return (
                <ListingCard
                  key={listing?.reservation?.id || listing.id}
                  data={listing}
                  hasFavorited={hasFavorited}
                  reservation={listing?.reservation}
                />
              );
            }
          )}
        </React.Fragment>
      ))}
      {(status === "pending" || isFetchingNextPage) && (
        <>
          {Array.from({ length: 4 }).map(
            (_item: any, i: number) => (
              <ListingSkeleton key={i} />
            )
          )}
        </>
      )}
      {status === "error" && (
        <p className="text-xl mt-8 text-center font-semibold">
          Something went wrong!
        </p>
      )}
      <div ref={ref} />
    </>
  );
};

export default LoadMore;
