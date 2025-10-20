// Tipos compartilhados entre frontend e backend

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface SheetData {
  id: string;
  name: string;
  data: any[];
  lastUpdated: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthContext {
  user: Omit<User, 'password'>;
  token: string;
}

// Placeholder para Waha (implementação futura)
export interface WahaSession {
  id: string;
  userId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}
