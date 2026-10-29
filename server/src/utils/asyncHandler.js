/**
 * asyncHandler utility to eliminate try-catch boilerplate in Express controllers.
 * Catches any Promise rejection or thrown Error and passes it to next(err),
 * reaching the centralized error handling middleware in server.js.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
