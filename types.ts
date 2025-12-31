

export type Language = 'UZ' | 'RU' | 'EN' | 'TR';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN'
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  username: string | null;
}

// Added LoginResponse for auth service
export interface LoginResponse {
  message?: string;
}

// Added VerifyResponse for auth service
export interface VerifyResponse {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Product {
  id: string;
  nameUz: string;
  nameRu: string;
  nameTr: string;
  nameEn: string;
  descUz: string;
  descRu: string;
  descTr: string;
  descEn: string;
  price: number;
  imgUrl: string;
  imgName?: string;
  imgSize?: number;
  currency: string;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: string;
  statusDescription: string;
  firstName: string;
  lastName: string;
  phone: string;
  description?: string;
  createdAt: string;
}

// Added OrderStatus for statistics service
export interface OrderStatus {
  code: string;
  label: string;
}

// Added Statistics for dashboard/statistics service
export interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  revenueByCurrency: Record<string, number>;
}

export interface Logo {
  imgUrl: string;
  imgName: string;
  imgSize: number;
}

export interface About {
  descriptionUz: string;
  descriptionRu: string;
  descriptionTr: string;
  descriptionEn: string;
  officeAddressUz: string;
  officeAddressRu: string;
  officeAddressTr: string;
  officeAddressEn: string;
  instagram: string;
  telegram: string;
  phone: string;
}
