const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Stream {
  id: number;
  user_id: number;
  username: string;
  title: string;
  description: string;
  stream_key: string;
  is_live: boolean;
  actual_start?: string;
  actual_end?: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface Video {
  id: number;
  user_id: number;
  username: string;
  stream_id?: number;
  title: string;
  description: string;
  file_path: string;
  thumbnail_url: string;
  duration?: number;
  view_count: number;
  created_at: string;
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  }

  // Stream endpoints
  async getStreams(): Promise<Stream[]> {
    return this.request<Stream[]>("/streams");
  }

  async getLiveStreams(): Promise<Stream[]> {
    return this.request<Stream[]>("/streams/live");
  }

  async getStream(id: string): Promise<Stream> {
    return this.request<Stream>(`/streams/${id}`);
  }

  async endStream(key: string): Promise<Stream> {
    return this.request<Stream>(`/streams/end`, {
      method: "POST",
      body: JSON.stringify({ name: key }),
    });
  }

  async createStream(formData: FormData): Promise<Stream> {
    const token = localStorage.getItem("auth_token");

    return this.request<Stream>("/streams", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  }

  // Video endpoints
  async getVideos(search?: string): Promise<Video[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request<Video[]>(`/videos${params}`);
  }

  async getVideo(id: string): Promise<Video> {
    return this.request<Video>(`/videos/${id}`);
  }

  async uploadVideo(formData: FormData): Promise<Video> {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  }
}

export const api = new ApiClient();
