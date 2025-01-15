const apiRequest = async (
  url: string,
  options: RequestInit,
  retries: number = 3,
  retryDelay: number = 1000
): Promise<any> => {
  const baseUrl = 'https://api.example.com';
  const fullUrl = `${baseUrl}${url}`;

  return fetchWithRetry(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      ...options.headers,
    },
  }, retries, retryDelay);
};

export const doGet = (url: string, retries: number = 3): Promise<any> =>
  apiRequest(url, { method: 'GET' }, retries);

export const doPost = (url: string, body: any, retries: number = 3): Promise<any> =>
  apiRequest(url, { method: 'POST', body: JSON.stringify(body) }, retries);

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries: number = 3, // liczba prób ponawiania
  retryDelay: number = 1000 // opóźnienie między próbami (w ms)
): Promise<any> => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Obsługa błędów HTTP (np. 5xx)
      if (response.status >= 500 && response.status < 600) {
        throw new Error(`Server error: ${response.status}`);
      } else {
        const errorData = await response.json();
        throw new Error(
          `HTTP Error ${response.status}: ${errorData.message || 'Unknown error'}`
        );
      }
    }

    // Sukces - zwracamy wynik
    return await response.json();
  } catch (error) {
    if (retries > 1) {
      console.warn(
        `Retrying... Attempts left: ${retries - 1}. Waiting ${retryDelay}ms.`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Opóźnienie
      return fetchWithRetry(url, options, retries - 1, retryDelay); // Rekurencyjne wywołanie
    } else {
      console.error('All retry attempts failed.');
      throw error; // Ostateczny błąd
    }
  }
};
