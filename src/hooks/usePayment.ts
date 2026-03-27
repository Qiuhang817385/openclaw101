'use client'

import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  createPCPayment,
  createH5Payment,
  queryOrder,
  getPayUrlForOrder,
} from '@/api/payment'
import { generateOrderNo } from '@/lib/utils'
import { PaymentType } from '@/types/payment'

interface UsePaymentOptions {
  onSuccess?: (orderId: string) => void
  onFailed?: (orderId: string) => void
}

export const ORDER_EXPIRE_MINUTES = 30

interface UsePaymentReturn {
  loading: boolean
  polling: boolean
  orderId: string | null
  orderStatus: string | null
  orderCreatedAt: number | null
  pay: (params: {
    totalAmount: number
    subject: string
    body?: string
    type?: PaymentType
  }) => Promise<void>
  startPolling: (orderId: string) => void
  stopPolling: () => void
  reset: () => void
  continuePay: (outTradeNo: string, createdAt?: number) => Promise<void>
  resumeWaiting: (orderId: string, orderCreatedAt: number) => void
}

export const usePayment = (options?: UsePaymentOptions): UsePaymentReturn => {
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const [orderCreatedAt, setOrderCreatedAt] = useState<number | null>(null)
  const pollingTimer = useRef<NodeJS.Timeout | null>(null)
  const pollingCount = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current)
      pollingTimer.current = null
    }
    pollingCount.current = 0
    setPolling(false)
  }, [])

  const startPolling = useCallback(
    (tradeNo: string) => {
      setPolling(true)
      pollingCount.current = 0

      pollingTimer.current = setInterval(async () => {
        pollingCount.current += 1

        try {
          const result = await queryOrder(tradeNo)

          if (result.success && result.data) {
            const { tradeStatus } = result.data

            if (
              tradeStatus === 'TRADE_SUCCESS' ||
              tradeStatus === 'TRADE_FINISHED'
            ) {
              setOrderStatus('success')
              stopPolling()
              options?.onSuccess?.(tradeNo)
              toast.success('支付成功！')
              return
            }

            if (tradeStatus === 'TRADE_CLOSED') {
              setOrderStatus('failed')
              stopPolling()
              options?.onFailed?.(tradeNo)
              toast.error('订单已关闭')
              return
            }
          }
        } catch {
          // 查询失败继续轮询
        }

        // 超过最大次数（30次 * 5秒 = 150秒）
        if (pollingCount.current >= 30) {
          setOrderStatus('pending')
          stopPolling()
          toast('支付结果待确认，请在订单列表查看', { icon: '⚠️' })
        }
      }, 5000)
    },
    [stopPolling, options],
  )

  const pay = useCallback(
    async (params: {
      totalAmount: number
      subject: string
      body?: string
      type?: PaymentType
    }) => {
      setLoading(true)
      const outTradeNo = generateOrderNo()

      try {
        const { totalAmount, subject, body, type = 'pc' } = params
        const createFn = type === 'pc' ? createPCPayment : createH5Payment

        const result = await createFn({
          outTradeNo,
          totalAmount,
          subject,
          body,
          userId: 'test_user',
        })

        if (result.success && result.payUrl?.payUrl) {
          setOrderId(outTradeNo)
          setOrderCreatedAt(Date.now())

          if (type === 'pc') {
            window.open(result.payUrl?.payUrl, '_blank', 'width=900,height=700')
          } else {
            window.location.href = result.payUrl?.payUrl
          }

          startPolling(outTradeNo)
          toast.success('支付页面已打开，请完成支付')
        } else {
          toast.error(result.message || '创建支付订单失败')
        }
      } catch {
        toast.error('支付请求失败，请重试')
      } finally {
        setLoading(false)
      }
    },
    [startPolling],
  )

  const reset = useCallback(() => {
    stopPolling()
    setLoading(false)
    setOrderId(null)
    setOrderStatus(null)
    setOrderCreatedAt(null)
  }, [stopPolling])

  const continuePay = useCallback(
    async (outTradeNo: string, createdAt?: number) => {
      setLoading(true)
      try {
        const result = await getPayUrlForOrder(outTradeNo)
        if (result.success && result.payUrl) {
          setOrderId(outTradeNo)
          setOrderCreatedAt(createdAt ?? Date.now())
          window.open(result.payUrl, '_blank', 'width=900,height=700')
          startPolling(outTradeNo)
          toast.success('支付页面已打开，请完成支付')
        } else {
          toast.error('获取支付链接失败')
        }
      } catch {
        toast.error('获取支付链接失败，请重试')
      } finally {
        setLoading(false)
      }
    },
    [startPolling],
  )

  const resumeWaiting = useCallback(
    (id: string, created: number) => {
      setOrderId(id)
      setOrderCreatedAt(created)
      setPolling(true)
      startPolling(id)
    },
    [startPolling],
  )

  return {
    loading,
    polling,
    orderId,
    orderStatus,
    orderCreatedAt,
    pay,
    startPolling,
    stopPolling,
    reset,
    continuePay,
    resumeWaiting,
  }
}
