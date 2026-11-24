/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError, notFound } from './errors'

/** Kết quả truy vấn Supabase (client không sinh kiểu → dùng cấu trúc lỏng). */
export interface LooseResult {
  data: unknown
  error: { message: string; code?: string } | null
}

function raise(res: LooseResult, fallback: string): any {
  const r = res as { data: any; error: { message: string } | null }
  if (r.error) {
    console.error('[db_error]', r.error.message)
    throw new AppError(500, 'db_error', fallback)
  }
  return r.data
}

/** Lấy 1 bản ghi, ném notFound khi trống. */
export function one(res: LooseResult, message = 'Không tìm thấy dữ liệu'): any {
  const data = raise(res, 'Lỗi truy vấn dữ liệu')
  if (data == null) throw notFound(message)
  return data
}

/** Lấy danh sách (luôn là mảng). */
export function many(res: LooseResult): any[] {
  const data = raise(res, 'Lỗi truy vấn dữ liệu')
  return data ?? []
}

/** Lấy 1 bản ghi có thể không tồn tại. */
export function maybe(res: LooseResult): any {
  const data = raise(res, 'Lỗi truy vấn dữ liệu')
  return data ?? null
}

/** Kiểm tra thao tác ghi (insert/update/delete). */
export function write(res: LooseResult): void {
  raise(res, 'Lỗi ghi dữ liệu')
}

export const ok = write
