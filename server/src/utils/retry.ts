interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2,
  shouldRetry: (error: any) => {
    // Default retry condition for common transient errors
    const retryStatusCodes = [408, 429, 503, 504];
    if (error?.response?.status) {
      return retryStatusCodes.includes(error.response.status);
    }
    // Network errors, connection timeouts, etc.
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' ||
           error.message?.includes('timeout');
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;
  let attempt = 1;

  while (attempt <= opts.maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delayMs = opts.delay * Math.pow(opts.backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      attempt++;
    }
  }

  throw lastError;
}

// Example usage:
// const result = await withRetry(
//   () => fetch('https://api.example.com/data'),
//   { maxAttempts: 3, delay: 1000 }
// );