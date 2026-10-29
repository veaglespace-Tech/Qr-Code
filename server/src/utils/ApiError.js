/**
 * Standard ApiError for throwing HTTP exceptions with specific status codes.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
