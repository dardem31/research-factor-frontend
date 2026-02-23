export interface UserDto {
  id: number;
  email: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
