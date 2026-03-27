export interface Product {
  id: string
  name: string
  description: string
  price: number
  features: string[]
}

export interface CreateOrderParams {
  outTradeNo: string
  totalAmount: number
  subject: string
  body?: string
  userId?: string
}

export interface CreateOrderResponse {
  success: boolean
  payUrl?: {
    payUrl: string
    outTradeNo: string
  }
  message?: string
}

export interface OrderQueryResult {
  success: boolean
  data?: {
    tradeNo: string
    tradeStatus: string
    totalAmount: number
    buyerId: string
  }
  message?: string
}

export interface Order {
  id: string
  outTradeNo: string
  tradeNo: string
  subject: string
  body: string
  totalAmount: number
  status: OrderStatus
  buyerId: string
  userId: string
  paidAt: string
  refundAmount: number
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'closed'
  | 'refunding'
  | 'refunded'

export type PaymentType = 'pc' | 'h5'

export interface OrderListResponse {
  list: Order[]
  total: number
  page: number
  pageSize: number
}

export interface RefundParams {
  outTradeNo: string
  refundAmount: number
  reason: string
}
