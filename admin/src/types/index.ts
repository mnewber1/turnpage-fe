export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  isPremium: boolean;
  isAdmin?: boolean;
  admin?: boolean;  // Jackson serializes isAdmin as "admin"
  createdAt: string;
  updatedAt: string;
}

export interface BookClub {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  isActive: boolean;
  isPrivate: boolean;
  isCommunity: boolean;
  memberCount?: number;
  messageCount?: number;
  createdAt: string;
  lastActivity?: string;
  host?: User;
  currentBook?: Book;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  bookClub?: BookClub;
  timestamp: string;
  isEdited: boolean;
  isDeleted: boolean;
  isReported: boolean;
  reportedBy?: string;
  reportedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalClubs: number;
  totalMessages: number;
  reportedMessages: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
}
