import request from '@/lib/axios'

export interface AppConfig {
  refundDeadlineHours: number
  paymentWaitMinutes: number
}

const DEFAULT_CONFIG: AppConfig = {
  refundDeadlineHours: 24,
  paymentWaitMinutes: 30,
}

let cached: AppConfig | null = null

/** 获取前端初始化配置（会缓存结果） */
export async function getConfig(): Promise<AppConfig> {
  if (cached) return cached
  try {
    const { data } = await request.get<AppConfig>('/config')
    cached = {
      refundDeadlineHours: data?.refundDeadlineHours ?? DEFAULT_CONFIG.refundDeadlineHours,
      paymentWaitMinutes: data?.paymentWaitMinutes ?? DEFAULT_CONFIG.paymentWaitMinutes,
    }
    return cached
  } catch {
    return DEFAULT_CONFIG
  }
}
