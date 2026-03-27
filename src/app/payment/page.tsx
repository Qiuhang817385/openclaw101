'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard from '@/components/payment/ProductCard'
import PayTypeSelector from '@/components/payment/PayTypeSelector'
import { usePayment } from '@/hooks/usePayment'
import { Product, PaymentType } from '@/types/payment'
import { formatAmount } from '@/lib/utils'
import { closeOrder, getOrderDetail } from '@/api/payment'
import toast from 'react-hot-toast'
import type { Order } from '@/types/payment'
import { useAppConfig } from '@/context/AppConfigContext'

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00'
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ContinuePayBanner({
  outTradeNo,
  onContinue,
  onDismiss,
}: {
  outTradeNo: string
  onContinue: (outTradeNo: string, createdAt?: number) => void
  onDismiss: () => void
}) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)

  useEffect(() => {
    let cancelled = false
    getOrderDetail(outTradeNo)
      .then((res: { success?: boolean; data?: Order }) => {
        if (!cancelled && res?.success && res.data) setOrder(res.data)
        else if (!cancelled) setOrder(null)
      })
      .catch(() => {
        if (!cancelled) setOrder(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingOrder(false)
      })
    return () => {
      cancelled = true
    }
  }, [outTradeNo])

  if (loadingOrder) {
    return (
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between">
        <span className="text-blue-700 text-sm">加载订单信息...</span>
      </div>
    )
  }
  if (!order) {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
        <span className="text-amber-700 text-sm">订单不存在或已关闭</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-700 text-sm font-medium underline"
        >
          关闭
        </button>
      </div>
    )
  }
  const isPending = String(order.status).toUpperCase() === 'PENDING'
  if (!isPending) {
    return (
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
        <span className="text-gray-600 text-sm">
          订单 {order.outTradeNo} 已支付或已关闭
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-600 text-sm font-medium underline"
        >
          关闭
        </button>
      </div>
    )
  }
  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-blue-800 font-medium">{order.subject}</p>
        <p className="text-blue-600 text-sm mt-0.5">
          订单号：{order.outTradeNo} · {formatAmount(order.totalAmount)}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-2 text-blue-600 text-sm font-medium hover:bg-blue-100 rounded-lg transition-colors"
        >
          新建订单
        </button>
        <button
          type="button"
          onClick={() =>
            onContinue(
              outTradeNo,
              new Date(order.createdAt).getTime(),
            )
          }
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          继续支付
        </button>
      </div>
    </div>
  )
}

function WaitingPaymentView({
  orderId,
  orderCreatedAt,
  paymentWaitMinutes,
  onCancel,
  onCompleted,
  onExpired,
}: {
  orderId: string
  orderCreatedAt: number | null
  paymentWaitMinutes: number
  onCancel: () => void
  onCompleted: () => void
  onExpired: () => void
}) {
  const expireMs = paymentWaitMinutes * 60 * 1000
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!orderCreatedAt) return paymentWaitMinutes * 60
    return Math.max(
      0,
      Math.floor((orderCreatedAt + expireMs - Date.now()) / 1000),
    )
  })
  const expiredHandled = useRef(false)

  useEffect(() => {
    if (!orderCreatedAt) return
    const tick = () => {
      const left = Math.max(
        0,
        Math.floor((orderCreatedAt + expireMs - Date.now()) / 1000),
      )
      setRemainingSeconds(left)
      if (left <= 0 && !expiredHandled.current) {
        expiredHandled.current = true
        ;(async () => {
          try {
            await closeOrder(orderId)
          } catch {
            // 关单失败也继续跳转，后端定时任务会补关
          }
          toast.error('订单已超时，已自动关闭')
          onExpired()
        })()
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [orderCreatedAt, expireMs, orderId, onExpired])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          等待支付结果...
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          请在打开的支付宝页面完成支付
        </p>
        <p className="text-gray-400 text-xs mb-2">订单号：{orderId}</p>

        <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2">
          <span className="text-amber-700 text-sm font-medium">
            订单将在
          </span>
          <span
            className={`font-mono text-lg font-bold tabular-nums ${
              remainingSeconds <= 60 ? 'text-red-600' : 'text-amber-700'
            }`}
          >
            {formatCountdown(remainingSeconds)}
          </span>
          <span className="text-amber-700 text-sm font-medium">
            后自动关闭
          </span>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-left mb-8 space-y-2">
          <p className="text-sm text-blue-700 font-medium">支付步骤：</p>
          <p className="text-sm text-blue-600">1. 在新窗口中打开支付宝页面</p>
          <p className="text-sm text-blue-600">
            2. 使用支付宝 App 扫码或账号登录
          </p>
          <p className="text-sm text-blue-600">3. 确认金额后完成支付</p>
          <p className="text-sm text-blue-600">4. 支付完成后此页面自动跳转</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            取消支付
          </button>
          <button
            onClick={onCompleted}
            className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            已完成支付
          </button>
        </div>
      </div>
    </div>
  )
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: '基础套餐',
    description: '适合个人用户',
    price: 9.9,
    features: ['5GB 存储空间', '每月 10GB 流量', '基础客服支持', '单设备登录'],
  },
  {
    id: '2',
    name: '专业套餐',
    description: '适合中小团队',
    price: 19.9,
    features: [
      '50GB 存储空间',
      '每月 100GB 流量',
      '优先客服支持',
      '5 设备同时登录',
      '数据导出功能',
    ],
  },
  {
    id: '3',
    name: '企业套餐',
    description: '适合大型企业',
    price: 29.9,
    features: [
      '无限存储空间',
      '不限流量',
      '7×24 专属客服',
      '无限设备登录',
      '数据导出功能',
      '专属 API 接口',
    ],
  },
]

export default function PaymentPage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentType>('pc')

  const searchParams = useSearchParams()
  const fromOrder = searchParams.get('fromOrder')
  const waitingOrder = searchParams.get('waitingOrder')
  const createdAtParam = searchParams.get('createdAt')
  const hasResumedRef = useRef(false)
  const { paymentWaitMinutes } = useAppConfig()

  const {
    loading,
    polling,
    orderId,
    orderCreatedAt,
    pay,
    reset,
    stopPolling,
    continuePay,
    resumeWaiting,
  } = usePayment({
    onSuccess: (orderId) => {
      router.push(`/payment/result?orderId=${orderId}&status=success`)
    },
    onFailed: (orderId) => {
      router.push(`/payment/result?orderId=${orderId}&status=failed`)
    },
  })

  const handlePay = async () => {
    if (!selectedProduct) return

    await pay({
      totalAmount: selectedProduct.price,
      subject: selectedProduct.name,
      body: selectedProduct.description,
      type: paymentType,
    })
  }

  useEffect(() => {
    if (hasResumedRef.current || !waitingOrder) return
    hasResumedRef.current = true
    const createdAt = createdAtParam
      ? parseInt(createdAtParam, 10)
      : Date.now()
    if (Number.isFinite(createdAt)) {
      resumeWaiting(waitingOrder, createdAt)
    }
    router.replace('/payment')
  }, [waitingOrder, createdAtParam, resumeWaiting, router])

  if (waitingOrder && !orderId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>正在打开支付...</p>
        </div>
      </div>
    )
  }

  if (polling && orderId) {
    return (
      <WaitingPaymentView
        orderId={orderId}
        orderCreatedAt={orderCreatedAt}
        paymentWaitMinutes={paymentWaitMinutes}
        onCancel={async () => {
          if (orderId) {
            try {
              await closeOrder(orderId)
            } catch {
              // 关单失败时 axios 拦截器已 toasts，仍重置本地状态
            }
          }
          reset()
        }}
        onCompleted={() =>
          router.push(`/payment/result?orderId=${orderId}&status=pending`)
        }
        onExpired={() => {
          stopPolling()
          reset()
          router.push(`/payment/result?orderId=${orderId}&status=failed`)
        }}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {fromOrder && (
        <ContinuePayBanner
          outTradeNo={fromOrder}
          onContinue={continuePay}
          onDismiss={() => router.replace('/payment')}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">选择套餐</h1>
        <p className="text-gray-500 mt-1">选择适合您的套餐，立即开启服务</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={selectedProduct?.id === product.id}
            onSelect={setSelectedProduct}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">支付方式</h2>

        <PayTypeSelector value={paymentType} onChange={setPaymentType} />

        <div className="border-t border-gray-100 my-6" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">
              {selectedProduct
                ? `已选择：${selectedProduct.name}`
                : '请选择套餐'}
            </p>
            {selectedProduct && (
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatAmount(selectedProduct.price)}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  / 月
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-primary">
            <span className="text-2xl">🔵</span>
            <span className="text-sm font-medium">支付宝支付</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={!selectedProduct || loading}
          className={`
            w-full py-4 rounded-xl font-semibold text-base transition-all duration-200
            ${
              selectedProduct && !loading
                ? 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-200 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {loading
            ? '正在创建订单...'
            : selectedProduct
              ? `立即支付 ${formatAmount(selectedProduct.price)}`
              : '请先选择套餐'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 支付数据经过 RSA2 加密，安全有保障
        </p>
      </div>
    </div>
  )
}
