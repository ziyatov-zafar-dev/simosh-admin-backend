
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

export interface ProductStat {
  productId: string;
  soldCount: number;
}

export interface Statistics {
  totalSold: number;
  products: ProductStat[];
}

export interface OrderStatus {
  code: string;
  description: string;
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

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyResponse {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}
