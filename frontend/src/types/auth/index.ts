export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
}

export interface RegisterResponse {
  user_id: number;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
}

export interface UserInfo {
  user_id: number;
  username: string;
  email: string;
}