/**
 * 生成唯一订单号
 */
export const generateOrderNo = (): string => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `ORDER${timestamp}${random}`
}

/**
 * 格式化金额
 */
export const formatAmount = (amount: number | string): string => {
  return `¥ ${parseFloat(amount.toString()).toFixed(2)}`
}

/**
 * 格式化时间
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** 订单未支付超时时间（分钟），与后端定时关单一致 */
export const ORDER_EXPIRE_MINUTES = 30

/**
 * 根据创建时间判断待支付订单是否已超时
 */
export function isOrderTimedOut(
  createdAt: string | Date,
  expireMinutes: number = ORDER_EXPIRE_MINUTES,
): boolean {
  const created = new Date(createdAt).getTime()
  return Date.now() - created > expireMinutes * 60 * 1000
}

/**
 * 订单状态映射
 */
export const ORDER_STATUS_MAP: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: { label: '待支付', color: '#d46b08', bgColor: '#fff7e6' },
  pending: { label: '待支付', color: '#d46b08', bgColor: '#fff7e6' },
  PAID: { label: '已支付', color: '#389e0d', bgColor: '#f6ffed' },
  paid: { label: '已支付', color: '#389e0d', bgColor: '#f6ffed' },
  CLOSED: { label: '已关闭', color: '#8c8c8c', bgColor: '#f5f5f5' },
  closed: { label: '已关闭', color: '#8c8c8c', bgColor: '#f5f5f5' },
  REFUNDING: { label: '退款中', color: '#096dd9', bgColor: '#e6f4ff' },
  refunding: { label: '退款中', color: '#096dd9', bgColor: '#e6f4ff' },
  REFUNDED: { label: '已退款', color: '#531dab', bgColor: '#f9f0ff' },
  refunded: { label: '已退款', color: '#531dab', bgColor: '#f9f0ff' },
  timed_out: {
    label: '已超时',
    color: '#8c8c8c',
    bgColor: '#f5f5f5',
  },
}
