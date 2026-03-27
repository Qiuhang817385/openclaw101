'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PayTypeSelector from '@/components/payment/PayTypeSelector'
import { usePayment } from '@/hooks/usePayment'
import { PaymentType } from '@/types/payment'
import { formatAmount } from '@/lib/utils'
import { closeOrder } from '@/api/payment'
import toast from 'react-hot-toast'
import { useAppConfig } from '@/context/AppConfigContext'

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00'
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const AMOUNT_OPTIONS = [
  { value: 9.9, label: '9.9', desc: '小杯咖啡 ☕' },
  { value: 19.9, label: '19.9', desc: '中杯咖啡 + 小食 🍪' },
  { value: 29.9, label: '29.9', desc: '大杯咖啡 + 蛋糕 🎂' },
]

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
    return Math.max(0, Math.floor((orderCreatedAt + expireMs - Date.now()) / 1000))
  })
  const expiredHandled = useRef(false)

  useEffect(() => {
    if (!orderCreatedAt) return
    const tick = () => {
      const left = Math.max(0, Math.floor((orderCreatedAt + expireMs - Date.now()) / 1000))
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
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">等待支付结果...</h2>
        <p className="text-gray-500 text-sm mb-2">请在打开的支付宝页面完成支付</p>
        <p className="text-gray-400 text-xs mb-2">订单号：{orderId}</p>

        <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2">
          <span className="text-amber-700 text-sm font-medium">订单将在</span>
          <span className={`font-mono text-lg font-bold tabular-nums ${remainingSeconds <= 60 ? 'text-red-600' : 'text-amber-700'}`}>
            {formatCountdown(remainingSeconds)}
          </span>
          <span className="text-amber-700 text-sm font-medium">后自动关闭</span>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-left mb-8 space-y-2">
          <p className="text-sm text-blue-700 font-medium">支付步骤：</p>
          <p className="text-sm text-blue-600">1. 在新窗口中打开支付宝页面</p>
          <p className="text-sm text-blue-600">2. 使用支付宝 App 扫码或账号登录</p>
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

function PaymentPageContent() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentType>('pc')

  const searchParams = useSearchParams()
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
    if (!selectedAmount) return
    await pay({
      totalAmount: selectedAmount,
      subject: '支持一下',
      body: '感谢你对 OpenClaw 中文教程的支持',
      type: paymentType,
    })
  }

  useEffect(() => {
    if (hasResumedRef.current || !waitingOrder) return
    hasResumedRef.current = true
    const createdAt = createdAtParam ? parseInt(createdAtParam, 10) : Date.now()
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
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">请我喝杯咖啡</h1>
        <p className="text-gray-500 text-sm">
          如果你觉得这个教程对你有帮助，欢迎请我喝杯咖啡
          <br />
          你的支持是我持续更新下去的动力 💪
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="font-semibold text-gray-800 mb-4">选择金额</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {AMOUNT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedAmount(opt.value)}
              className={`
                relative flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all duration-200
                ${selectedAmount === opt.value
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
                }
              `}
            >
              {selectedAmount === opt.value && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className={`text-2xl font-bold ${selectedAmount === opt.value ? 'text-primary' : 'text-gray-800'}`}>
                ¥{opt.label}
              </span>
              <span className="text-xs text-gray-400 mt-1">{opt.desc}</span>
            </button>
          ))}
        </div>

        <PayTypeSelector value={paymentType} onChange={setPaymentType} />

        <div className="border-t border-gray-100 my-6" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">支持金额</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {selectedAmount ? formatAmount(selectedAmount) : '—'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <span className="text-2xl">🔵</span>
            <span className="text-sm font-medium">支付宝支付</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={!selectedAmount || loading}
          className={`
            w-full py-4 rounded-xl font-semibold text-base transition-all duration-200
            ${selectedAmount && !loading
              ? 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-200 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {loading
            ? '正在创建订单...'
            : selectedAmount
              ? `支持一下 ${formatAmount(selectedAmount)}`
              : '请选择金额'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 支付数据经过 RSA2 加密，安全有保障
        </p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>加载中...</p>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  )
}
