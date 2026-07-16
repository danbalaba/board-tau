import { ApiResponseFormatter, formatApiResponse, formatApiError } from '../api-response';

describe('api-response', () => {
  describe('ApiResponseFormatter', () => {
    it('creates a success response', () => {
      const response = ApiResponseFormatter.success({ id: 1 }, 'Success message', { total: 10 });
      expect(response).toEqual({
        success: true,
        data: { id: 1 },
        message: 'Success message',
        meta: { total: 10 }
      });
    });

    it('creates an error response', () => {
      const response = ApiResponseFormatter.error('NOT_FOUND', 'Item not found', { id: 1 });
      expect(response).toEqual({
        success: false,
        error: 'NOT_FOUND',
        message: 'Item not found',
        details: { id: 1 }
      });
    });
  });

  describe('Helper functions', () => {
    it('formats a success response using formatApiResponse', () => {
      const response = formatApiResponse('data', 'msg', { page: 1 });
      expect(response.success).toBe(true);
      expect(response.data).toBe('data');
      expect(response.message).toBe('msg');
    });

    it('formats an error response using formatApiError', () => {
      const response = formatApiError('ERROR', 'errMsg', { cause: 'cause' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('ERROR');
      expect(response.message).toBe('errMsg');
    });
  });
});
