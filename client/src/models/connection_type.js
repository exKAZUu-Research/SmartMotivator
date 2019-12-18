// @flow

type Response<T, E> =
  | { success: true, data: T }
  | { success: false, error: 'badRequest', data: E }
  | { success: false, error: 'forbidden' }
  | { success: false, error: 'notFound' }
  | { success: false, error: 'internalServerError' }
  | { success: false, error: 'serviceUnavailable' }
  | { success: false, error: 'offline' };

export type ResponseP<T, E = {}> = Promise<Response<T, E>>;
