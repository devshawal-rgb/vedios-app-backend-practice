import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error Details:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};
