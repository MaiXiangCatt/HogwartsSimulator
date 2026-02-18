import request from '@/lib/request';
import type { RegisterParams, RegisterResponse, LoginParams, LoginResponse, UserInfo} from '@/types/auth';

export const register = (params: RegisterParams) => {
  return request.post<RegisterResponse>('auth/register', params);
}

export const login = (params: LoginParams) => {
  return request.post<LoginResponse>('auth/login', params);
}

export const getUserInfo = () => {
  return request.get<UserInfo>('auth/user');
}