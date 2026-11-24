import type { Context } from 'hono'
import type { ZodTypeAny, infer as zodInfer } from 'zod'

/** Đọc JSON body và kiểm tra bằng zod; ném ZodError (được xử lý ở errorHandler). */
export async function jsonBody<T extends ZodTypeAny>(
  c: Context,
  schema: T,
): Promise<zodInfer<T>> {
  let raw: unknown = {}
  try {
    raw = await c.req.json()
  } catch {
    raw = {}
  }
  return schema.parse(raw)
}

/** Đọc & kiểm tra query params bằng zod. */
export function query<T extends ZodTypeAny>(c: Context, schema: T): zodInfer<T> {
  return schema.parse(c.req.query())
}
