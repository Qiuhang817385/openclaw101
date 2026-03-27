'use client'

import { PaymentType } from '@/types/payment'

interface PayTypeSelectorProps {
  value: PaymentType
  onChange: (type: PaymentType) => void
}

const PAY_TYPES = [
  {
    value: 'pc' as PaymentType,
    label: '电脑网站支付',
    icon: '💻',
    desc: '适合在电脑上完成支付',
  },
  {
    value: 'h5' as PaymentType,
    label: '手机网站支付',
    icon: '📱',
    desc: '适合在手机上完成支付',
  },
]

export default function PayTypeSelector({
  value,
  onChange,
}: PayTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PAY_TYPES.map((type) => (
        <div
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`
            cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
            ${
              value === type.value
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${value === type.value ? 'border-primary' : 'border-gray-300'}
              `}
            >
              {value === type.value && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span>{type.icon}</span>
                <span className="text-sm font-medium text-gray-800">
                  {type.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
