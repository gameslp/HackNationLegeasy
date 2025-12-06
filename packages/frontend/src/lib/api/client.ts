const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data: T;
  error: null | { message: string; code: string };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const json: ApiResponse<T> = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    return json.data;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile<T>(endpoint: string, file: File, fileType: string): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const json: ApiResponse<T> = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    return json.data;
  }
}

export const apiClient = new ApiClient(API_URL);
