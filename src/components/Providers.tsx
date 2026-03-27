'use client'

import { Toaster } from 'react-hot-toast'
import { AppConfigProvider } from '@/context/AppConfigContext'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppConfigProvider>
      <Toaster position="top-center" />
      {children}
    </AppConfigProvider>
  )
}
