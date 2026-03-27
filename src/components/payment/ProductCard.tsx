'use client'

import { Product } from '@/types/payment'
import { formatAmount } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  selected: boolean
  onSelect: (product: Product) => void
}

export default function ProductCard({
  product,
  selected,
  onSelect,
}: ProductCardProps) {
  return (
    <div
      onClick={() => onSelect(product)}
      className={`
        relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${
          selected
            ? 'border-primary bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-blue-300'
        }
      `}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{product.description}</p>

      <div className="mb-4">
        <span className="text-3xl font-bold text-primary">
          {formatAmount(product.price)}
        </span>
        <span className="text-sm text-gray-400 ml-1">/ 月</span>
      </div>

      <ul className="space-y-2">
        {product.features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <span className="text-green-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
