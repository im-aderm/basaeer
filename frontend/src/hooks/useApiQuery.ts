'use client';

import { useQuery, useMutation, useQueryClient, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import api from '@/lib/api';
import { AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

interface ApiQueryOptions<TData = unknown> {
  url: string;
  params?: Record<string, unknown>;
  config?: AxiosRequestConfig;
  queryKey?: QueryKey;
  enabled?: boolean;
  staleTime?: number;
}

export function useApiQuery<TData = unknown>({
  url,
  params,
  config,
  queryKey,
  enabled = true,
  staleTime = 60_000,
}: ApiQueryOptions<TData>) {
  const key = queryKey ?? [url, params];

  return useQuery<TData>({
    queryKey: key,
    queryFn: async () => {
      const res = await api.get<TData>(url, { params, ...config });
      return res.data;
    },
    enabled,
    staleTime,
  });
}

interface ApiMutationOptions<TData = unknown, TVariables = unknown> {
  method?: 'post' | 'put' | 'patch' | 'delete';
  url: string;
  invalidateQueries?: QueryKey[];
  successMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
}

export function useApiMutation<TData = unknown, TVariables = unknown>({
  method = 'post',
  url,
  invalidateQueries,
  successMessage,
  onSuccess,
}: ApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const res = await api[method]<TData>(url, variables);
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (invalidateQueries) {
        invalidateQueries.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables);
    },
  });
}
