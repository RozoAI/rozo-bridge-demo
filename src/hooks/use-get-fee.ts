import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface GetFeeParams {
  amount: number;
  appId?: string;
  currency?: string;
}

export interface GetFeeResponse {
  appId: string;
  amount: number;
  currency: string;
  fee: number;
  feePercentage: string;
  minimumFee: string;
  amount_out: number;
}

export interface GetFeeError {
  error: string;
  message: string;
  received: number;
  maxAllowed: number;
}

const fetchFee = async (
  params: GetFeeParams
): Promise<GetFeeResponse | undefined> => {
  if (params.amount <= 0) {
    return;
  }

  const queryParams = new URLSearchParams({
    amount: params.amount.toString(),
    ...(params.appId && { appId: params.appId }),
    ...(params.currency && { currency: params.currency }),
  });

  const response = await fetch(
    `https://intentapi.rozo.ai/getFee?${queryParams.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    if (errorData && errorData.error) {
      // Throw the error data so we can access it in the component
      throw errorData;
    }

    throw new Error(
      `Failed to fetch fee: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const useGetFee = (
  params: GetFeeParams,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    debounceMs?: number;
  }
) => {
  const [debouncedParams, setDebouncedParams] = useState(params);
  const debounceMs = options?.debounceMs ?? 500;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams(params);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [params.amount, params.appId, params.currency, debounceMs]);

  return useQuery({
    queryKey: [
      "fee",
      debouncedParams.amount,
      debouncedParams.appId,
      debouncedParams.currency,
    ],
    queryFn: () => fetchFee(debouncedParams),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: 30000, // 30 seconds
    retry: false, // Don't retry on error
  });
};
