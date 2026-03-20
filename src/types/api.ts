export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: {
      fields: Record<string, string>;
    };
  };
}
