// User Types
export enum UserRole {
  USER = 'USER',
  ARTIST = 'ARTIST',
  PROMOTER = 'PROMOTER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Health Check Types
export interface HealthCheckResponse {
  status: string
  timestamp: string
  uptime: number
  database: string
  redis: string
  environment: string
}
