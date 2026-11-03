const { describe, it } = require('node:test');
const assert = require('node:assert');
const ApiError = require('../../server/src/utils/ApiError');
const asyncHandler = require('../../server/src/utils/asyncHandler');

describe('ApiError & asyncHandler Unit Tests', () => {
  it('should instantiate ApiError with correct statusCode and message', () => {
    const error = new ApiError(404, 'Resource not found');

    assert.ok(error instanceof Error);
    assert.ok(error instanceof ApiError);
    assert.strictEqual(error.statusCode, 404);
    assert.strictEqual(error.status, 404);
    assert.strictEqual(error.message, 'Resource not found');
    assert.ok(error.stack);
  });

  it('asyncHandler should pass successful async controller execution to next() or finish cleanly', async () => {
    let handled = false;
    const mockController = async (req, res, next) => {
      res.json({ success: true });
      handled = true;
    };

    const wrapped = asyncHandler(mockController);
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        assert.strictEqual(data.success, true);
      }
    };
    const mockNext = (err) => {
      if (err) assert.fail(`next() should not be called with error: ${err.message}`);
    };

    await wrapped(mockReq, mockRes, mockNext);
    assert.strictEqual(handled, true);
  });

  it('asyncHandler should catch rejected promises and forward error to next(err)', async () => {
    const expectedError = new ApiError(400, 'Invalid request data');
    const mockController = async () => {
      throw expectedError;
    };

    const wrapped = asyncHandler(mockController);
    const mockReq = {};
    const mockRes = {};
    let errorCaught = null;
    const mockNext = (err) => {
      errorCaught = err;
    };

    await wrapped(mockReq, mockRes, mockNext);
    assert.strictEqual(errorCaught, expectedError);
    assert.strictEqual(errorCaught.statusCode, 400);
  });

  it('asyncHandler should catch synchronous errors thrown inside controllers', async () => {
    const syncError = new Error('Unexpected synchronous exception');
    const mockController = () => {
      throw syncError;
    };

    const wrapped = asyncHandler(mockController);
    let errorCaught = null;
    const mockNext = (err) => {
      errorCaught = err;
    };

    await wrapped({}, {}, mockNext);
    assert.strictEqual(errorCaught, syncError);
  });
});
