'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { queryOrder } from '@/api/payment'
import { formatAmount, formatDate } from '@/lib/utils'

type ResultStatus = 'loading' | 'success' | 'pending' | 'failed'

interface TradeInfo {
  orderId: string
  tradeNo?: string
  amount?: number
  paidAt?: string
}

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<ResultStatus>('loading')
  const [tradeInfo, setTradeInfo] = useState<TradeInfo | null>(null)

  const orderId = searchParams.get('orderId') || ''
  const statusParam = searchParams.get('status')

  useEffect(() => {
    if (!orderId) {
      setStatus('failed')
      return
    }

    if (statusParam === 'success') {
      setStatus('success')
    } else if (statusParam === 'failed') {
      setStatus('failed')
    }

    const verifyPayment = async () => {
      try {
        const result = await queryOrder(orderId)

        if (result.success && result.data) {
          const { tradeNo, tradeStatus, totalAmount } = result.data

          setTradeInfo({
            orderId,
            tradeNo,
            amount: totalAmount,
          })

          if (
            tradeStatus === 'TRADE_SUCCESS' ||
            tradeStatus === 'TRADE_FINISHED'
          ) {
            setStatus('success')
          } else if (tradeStatus === 'TRADE_CLOSED') {
            setStatus('failed')
          } else {
            setStatus('pending')
          }
        } else {
          setStatus(
            statusParam === 'success'
              ? 'success'
              : statusParam === 'failed'
                ? 'failed'
                : 'pending',
          )
          setTradeInfo({ orderId })
        }
      } catch {
        setStatus('pending')
        setTradeInfo({ orderId })
      }
    }

    verifyPayment()
  }, [orderId, statusParam])

  if (status === 'loading') {
    return (
      <div className="text-center py-20">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-500">正在确认支付结果...</p>
      </div>
    )
  }

  const CONFIG = {
    success: {
      icon: '✅',
      title: '支付成功！',
      titleColor: 'text-green-600',
      desc: '感谢您的购买，服务已为您开通',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
    },
    pending: {
      icon: '⏳',
      title: '支付结果确认中',
      titleColor: 'text-yellow-600',
      desc: '支付结果正在处理，请稍后在订单列表查看',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-100',
    },
    failed: {
      icon: '❌',
      title: '支付失败',
      titleColor: 'text-red-600',
      desc: '订单支付未成功，您可以重新发起支付',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
    },
  }

  const config = CONFIG[status]

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className={`${config.bgColor} ${config.borderColor} border-b px-6 py-10 text-center`}
        >
          <div className="text-6xl mb-4">{config.icon}</div>
          <h1 className={`text-2xl font-bold ${config.titleColor} mb-2`}>
            {config.title}
          </h1>
          <p className="text-sm text-gray-500">{config.desc}</p>
        </div>

        {tradeInfo && (
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">商户订单号</span>
              <span className="text-sm text-gray-600 font-mono">
                {tradeInfo.orderId}
              </span>
            </div>
            {tradeInfo.tradeNo && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">支付宝单号</span>
                <span className="text-sm text-gray-600 font-mono">
                  {tradeInfo.tradeNo}
                </span>
              </div>
            )}
            {tradeInfo.amount !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">支付金额</span>
                <span className="text-lg font-bold text-primary">
                  {formatAmount(tradeInfo.amount)}
                </span>
              </div>
            )}
            {tradeInfo.paidAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">支付时间</span>
                <span className="text-sm text-gray-600">
                  {formatDate(tradeInfo.paidAt)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="px-6 pb-6 space-y-3">
          {status === 'success' && (
            <>
              <Link
                href="/payment"
                className="block w-full py-3 bg-primary text-white text-center rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                返回支付页面
              </Link>
              <Link
                href="/"
                className="block w-full py-3 bg-gray-100 text-gray-600 text-center rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                返回首页
              </Link>
            </>
          )}

          {status === 'pending' && (
            <>
              <Link
                href="/payment"
                className="block w-full py-3 bg-primary text-white text-center rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                返回支付页面
              </Link>
              <Link
                href="/"
                className="block w-full py-3 bg-gray-100 text-gray-600 text-center rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                返回首页
              </Link>
            </>
          )}

          {status === 'failed' && (
            <>
              <Link
                href="/payment"
                className="block w-full py-3 bg-primary text-white text-center rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                重新支付
              </Link>
              <Link
                href="/"
                className="block w-full py-3 bg-gray-100 text-gray-600 text-center rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                返回首页
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  )
}
