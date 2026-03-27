'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { getConfig, type AppConfig } from '@/api/config'

const defaultConfig: AppConfig = {
  refundDeadlineHours: 24,
  paymentWaitMinutes: 30,
}

const AppConfigContext = createContext<{
  config: AppConfig
  loading: boolean
  refresh: () => Promise<void>
}>({
  config: defaultConfig,
  loading: true,
  refresh: async () => {},
})

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const next = await getConfig()
      setConfig(next)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <AppConfigContext.Provider value={{ config, loading, refresh: load }}>
      {children}
    </AppConfigContext.Provider>
  )
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext)
  return ctx.config
}

export function useAppConfigState() {
  return useContext(AppConfigContext)
}
