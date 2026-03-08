import { RouteResponse } from '@/core/http/types';

export interface BaseResponse<T> {
  message: string;
  data: T;
}

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export function createRouteResponse<T>(params: {
  data: T;
  message: string;
  statusCode?: number;
}): RouteResponse {
  return {
    status: params.statusCode ?? 200,
    body: {
      message: params.message,
      data: params.data,
    },
  };
}
