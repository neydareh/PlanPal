export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    correlationId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    correlationId?: string;
  };
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
}
