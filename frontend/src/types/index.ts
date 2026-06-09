export type PropertyType = 'HOTEL' | 'APARTMENT' | 'HOMESTAY' | 'VILLA' | 'OTHER'

export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'DUPLEX' | 'FAMILY'

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'

export type TransactionType = 'INCOME' | 'EXPENSE' | 'ADJUSTMENT'

export type UserRole = 'ADMIN' | 'STAFF'

export interface Property {
  id: number
  name: string
  type: PropertyType
  description?: string
  phone?: string
  address?: string
  images?: string[]
  amenities?: string[]
  checkInInstructions?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: number
  propertyId: number
  name: string
  type: RoomType
  description?: string
  address?: string
  capacity?: number
  images?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Guest {
  id: number
  fullName: string
  phone?: string
  email?: string
  nationality?: string
  documentNumber?: string
  documentImages?: string[]
  address?: string
  notes?: string
  createdAt: string
}

export interface Reservation {
  id: number
  reservationNumber: string
  propertyId: number
  roomId: number
  guestId?: number
  checkInTime: string
  checkOutTime: string
  price: number
  discount?: number
  finalPrice: number
  notes?: string
  status: ReservationStatus
  property?: Property
  room?: Room
  guest?: Guest
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  amount: number
  type: TransactionType
  date: string
  description: string
  notes?: string
  createdBy: string
  propertyId: number
  createdAt: string
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOTEL: 'Hotel',
  APARTMENT: 'Căn hộ dịch vụ',
  HOMESTAY: 'Homestay',
  VILLA: 'Villa',
  OTHER: 'Khác',
}

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  STANDARD: 'Standard',
  DELUXE: 'Deluxe',
  SUITE: 'Suite',
  DUPLEX: 'Duplex',
  FAMILY: 'Family Room',
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận phòng',
  CHECKED_OUT: 'Đã trả phòng',
  CANCELLED: 'Đã hủy',
}

export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  CHECKED_IN: 'green',
  CHECKED_OUT: 'default',
  CANCELLED: 'red',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Thu',
  EXPENSE: 'Chi',
  ADJUSTMENT: 'Điều chỉnh',
}

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  INCOME: 'success',
  EXPENSE: 'error',
  ADJUSTMENT: 'warning',
}

export const AMENITY_OPTIONS = [
  'WiFi',
  'Điều hòa',
  'Bãi đỗ xe',
  'Hồ bơi',
  'Gym',
  'Nhà hàng',
  'Quầy bar',
  'Dịch vụ phòng',
  'Spa',
  'Thang máy',
  'Máy giặt',
  'Bếp',
]
