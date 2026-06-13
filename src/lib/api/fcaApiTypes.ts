export interface ApiSuccess<T> {
  ok: true
  data: T
  meta?: {
    requestId?: string
    timestamp?: string
    packet?: string
  }
}

export interface ApiError {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiError
