export interface UserDto {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN' | 'RESEARCH_SUPERVISOR';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
