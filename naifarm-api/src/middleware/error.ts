import type { ErrorHandler, NotFoundHandler } from 'hono'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'
import type { AppEnv } from './auth'

/** Lỗi trả về theo `application/problem+json`. */
export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { type: 'about:blank', title: err.message, status: err.status, code: err.code, details: err.details },
      err.status as never,
    )
  }
  if (err instanceof ZodError) {
    return c.json(
      {
        type: 'about:blank',
        title: 'Dữ liệu không hợp lệ',
        status: 422,
        code: 'validation_error',
        details: err.flatten(),
      },
      422 as never,
    )
  }
  console.error('[unhandled]', err)
  return c.json(
    { type: 'about:blank', title: 'Lỗi hệ thống', status: 500, code: 'internal_error' },
    500 as never,
  )
}

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  c.json({ type: 'about:blank', title: 'Không tìm thấy endpoint', status: 404, code: 'not_found' }, 404)
