"use client";

import { useQuery } from "@tanstack/react-query";
import { getLandlordNotifications } from "../actions";

export function useNotifications() {
  return useQuery({
    queryKey: ["landlord-notifications"],
    queryFn: () => getLandlordNotifications(),
    refetchInterval: 30000, // 30 seconds for "real-time" simulation
    staleTime: 10000,
  });
}
