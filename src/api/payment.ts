import request from '@/lib/axios'
import {
  CreateOrderParams,
  CreateOrderResponse,
  OrderQueryResult,
  OrderListResponse,
  RefundParams,
} from '@/types/payment'

// 创建 PC 端支付订单
export const createPCPayment = async (
  params: CreateOrderParams,
): Promise<CreateOrderResponse> => {
  const { data } = await request.post('/payment/pc/create', params)
  return data
}

// 创建 H5 端支付订单
export const createH5Payment = async (
  params: CreateOrderParams,
): Promise<CreateOrderResponse> => {
  const { data } = await request.post('/payment/h5/create', params)
  return data
}

// 查询订单状态
export const queryOrder = async (
  outTradeNo: string,
): Promise<OrderQueryResult> => {
  const { data } = await request.get('/payment/query', {
    params: { outTradeNo },
  })
  return data
}

// 获取待支付订单的支付链接（继续支付）
export const getPayUrlForOrder = async (
  outTradeNo: string,
): Promise<{ success: boolean; payUrl: string; outTradeNo: string }> => {
  const { data } = await request.get('/payment/pay-url', {
    params: { outTradeNo },
  })
  return data
}

// 关闭订单
export const closeOrder = async (outTradeNo: string) => {
  const { data } = await request.post('/payment/close', { outTradeNo })
  return data
}

// 申请退款
export const refundOrder = async (params: RefundParams) => {
  const { data } = await request.post('/payment/refund', params)
  return data
}

// 获取订单列表
export const getOrderList = async (
  page = 1,
  pageSize = 10,
  userId?: string,
): Promise<OrderListResponse> => {
  const { data } = await request.get('/orders', {
    params: { page, pageSize, userId },
  })
  return data
}

// 获取订单详情
export const getOrderDetail = async (outTradeNo: string) => {
  const { data } = await request.get(`/orders/${outTradeNo}`)
  return data
}
