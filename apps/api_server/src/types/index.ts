export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  created_at: Date;
}

export interface Stream {
  id: number;
  user_id: number;
  title: string;
  description: string;
  stream_key: string;
  is_live: boolean;
  scheduled_start: Date;
  actual_start?: Date;
  actual_end?: Date;
  thumbnail_url?: string;
  created_at: Date;
}

export interface Video {
  id: number;
  user_id: number;
  stream_id?: number;
  title: string;
  description: string;
  file_path: string;
  thumbnail_url: string;
  duration?: number;
  view_count: number;
  created_at: Date;
}

export interface ChatMessage {
  id: string;
  stream_id: number;
  user_id: number;
  username: string;
  message: string;
  timestamp: Date;
}
