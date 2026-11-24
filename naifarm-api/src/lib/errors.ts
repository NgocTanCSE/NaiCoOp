export class AppError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, 'bad_request', message, details)

export const unauthorized = (message = 'Cần đăng nhập') =>
  new AppError(401, 'unauthorized', message)

export const forbidden = (message = 'Không có quyền thực hiện thao tác này') =>
  new AppError(403, 'forbidden', message)

export const notFound = (message = 'Không tìm thấy dữ liệu') =>
  new AppError(404, 'not_found', message)

export const conflict = (message: string, details?: unknown) =>
  new AppError(409, 'conflict', message, details)

export const unprocessable = (message: string, details?: unknown) =>
  new AppError(422, 'unprocessable', message, details)
