export type UserRole = 'owner' | 'admin_dkm' | 'petugas_amil';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  masjidId?: string | null;
  masjidName?: string;
  isActive: boolean;
  token?: string;
}

export interface MasjidAccount {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province?: string;
  contactPhone: string;
  email: string;
  leadName: string;
  status: 'active' | 'pending_verification' | 'suspended';
  hijriYear: string;
  masehiYear: string;
  createdAt: string;
  recommendationLetterName?: string;
  recommendationLetterData?: string;
  recommendationLetterUploadedAt?: string;
  // Computed stats for owner dashboard
  totalTransactions?: number;
  totalMuzakkiSouls?: number;
  totalFitrahRiceKg?: number;
  totalFitrahCashRp?: number;
  totalMaalRp?: number;
  totalMustahiqCount?: number;
}

export interface RegisterMasjidPayload {
  masjidName: string;
  leadName: string;
  address: string;
  city: string;
  province?: string;
  contactPhone: string;
  email: string;
  username: string;
  password: string;
  hijriYear?: string;
  masehiYear?: string;
  recommendationLetterName?: string;
  recommendationLetterData?: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  captchaToken?: string;
}

export interface ResetPasswordPayload {
  usernameOrEmail: string;
  newPassword: string;
  verificationCode: string;
}

export interface PasswordResetTicket {
  id: string;
  userId: string;
  username: string;
  accountName: string;
  masjidId?: string | null;
  masjidName?: string;
  phone: string;
  email: string;
  maskedContact: string;
  code: string;
  requestedAt: string;
  expiresAt: number;
  status: 'pending' | 'resolved' | 'expired';
}

export interface WhatsAppGatewayConfig {
  enabled: boolean;
  provider: 'fonnte' | 'wablas' | 'starsender' | 'waha' | 'custom';
  apiToken: string;
  customEndpoint?: string;
  senderName?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | null;
}

export interface AuthSession {
  user: UserAccount | null;
  currentMasjid: MasjidAccount | null;
  isAuthenticated: boolean;
}
