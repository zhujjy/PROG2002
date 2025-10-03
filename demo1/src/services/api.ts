// API 服务配置和封装

// API基础配置
// 在开发环境使用相对路径配合Vite代理，生产可用环境变量或默认后端地址
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5051/api')

// API响应接口定义
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
  message?: string
  error?: string
  total?: number
  success?: boolean
}

// 活动数据接口定义（匹配PHP API返回的数据结构）
export interface Activity {
  id: number
  background_image: string
  title: string
  subtitle: string
  article_detail_id: number
  status: 'normal' | 'hidden' // PHP API中的状态值
  createtime: number
  updatetime: number
  expirationtime: number
  // 以下字段可能不存在于后端返回数据中，设为可选
  name?: string
  description?: string
  full_description?: string
  event_date?: string
  location?: string
  target_amount?: number
  current_amount?: number
  currency_type?: string // 货币类型字段
  ticket_price?: number
  is_free?: number // PHP返回的是数字0/1
  max_participants?: number
  current_participants?: number
  image_url?: string
  category_name?: string
  organization_name?: string
  organization_description?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  organization_address?: string
  registration_deadline?: string
  // 奖励/报名相关字段（来自 fa_activity_reward）
  reward_id?: number
  registration_fee?: number | string
  participant_count?: number
  reward_status?: string
  // 新增：奖励表中的已筹集金额字段 havemoney（用于覆盖/补充活动表的 current_amount）
  reward_havemoney?: number | string
}

// 慈善活动接口定义（前端使用的格式）
export interface CharityEvent {
  id: number
  name: string
  description: string
  full_description?: string
  event_date: string
  location: string
  target_amount: number
  current_amount: number
  currency_type: string // 货币类型字段
  ticket_price: number
  is_free: boolean // 前端使用布尔值
  max_participants?: number
  current_participants: number
  status: 'upcoming' | 'ongoing' | 'ended' | 'suspended'
  image_url?: string
  category_name: string
  organization_name: string
  organization_description?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  organization_address?: string
  registration_deadline?: string
  expirationtime?: string // 后端返回的过期时间，格式：YYYY-MM-DD HH:MM:SS
}

// 活动类别接口定义
export interface EventCategory {
  id: number
  name: string
  description?: string
}

// 慈善机构接口定义
export interface Organization {
  id: number
  name: string
  description?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  address?: string
}

// 搜索参数接口
export interface SearchParams {
  date?: string
  location?: string
  category?: string | number
  status?: string
}

// HTTP请求封装函数
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log('🌐 API请求开始:', url)
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    }

    console.log('📤 请求配置:', { url, options: { ...defaultOptions, ...options } })
    
    const response = await fetch(url, { ...defaultOptions, ...options })
    
    console.log('📥 响应状态:', response.status, response.statusText)
    console.log('📥 响应头:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API响应数据:', data)
    return data
  } catch (error) {
    console.error('❌ API请求错误:', error)
    console.error('❌ 错误详情:', {
      message: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
      url: `${API_BASE_URL}${endpoint}`
    })
    throw error
  }
}

// 将PHP API返回的Activity对象转换为前端使用的CharityEvent对象
function convertActivityToCharityEvent(activity: Activity): CharityEvent {
  // 确定状态映射
  let status: 'upcoming' | 'ongoing' | 'ended' | 'suspended' = 'upcoming'
  const now = new Date()
  
  // 如果有event_date字段，使用它来判断状态
  if (activity.event_date) {
    const eventDate = new Date(activity.event_date)
    if (activity.status === 'normal') {
      if (eventDate > now) {
        status = 'upcoming'
      } else if (eventDate < now) {
        status = 'ended'
      } else {
        status = 'ongoing'
      }
    } else {
      status = 'suspended'
    }
  } else {
    // 如果没有event_date，根据status判断
    status = activity.status === 'normal' ? 'upcoming' : 'suspended'
  }

  // 处理图片URL - 优先使用image_url，然后是background_image
  let imageUrl = activity.image_url || activity.background_image || ''
  // Preserve relative path to avoid fixed port cross-origin or inaccessible issues
  // If the path starts with "/", let the current site resolve it without attaching domain or port
  if (imageUrl && imageUrl.startsWith('/')) {
    // no-op: Preserve relative path
  }
  
  return {
    id: activity.id,
    name: activity.name || activity.title || 'Untitled Event',
    description: activity.description || activity.subtitle || 'No description',
    full_description: activity.full_description,
    event_date: activity.event_date || new Date().toISOString(),
    location: activity.location || 'undetermined',
    target_amount: activity.target_amount || 0,
    // Current raised amount: prefer reward havemoney, fallback to activity current_amount (ensure number)
    current_amount: (activity.reward_havemoney != null 
      ? Number(activity.reward_havemoney) 
      : Number(activity.current_amount || 0)),
    currency_type: activity.currency_type || 'USD', // The default is USD
    // Prefer registration_fee (from reward), otherwise fallback to ticket_price
    ticket_price: (activity.registration_fee != null ? Number(activity.registration_fee) : (activity.ticket_price || 0)),
    // Free determination: primarily based on registration_fee being 0; otherwise use is_free/ticket_price
    is_free: (activity.registration_fee != null ? Number(activity.registration_fee) === 0 : (activity.is_free === 1 || (activity.ticket_price || 0) === 0)),
    max_participants: activity.max_participants,
    // Participants: prefer participant_count (from reward), otherwise fallback to current_participants
    current_participants: (activity.participant_count != null ? Number(activity.participant_count) : (activity.current_participants || 0)),
    status: status,
    image_url: imageUrl,
    category_name: activity.category_name || 'Other',
    organization_name: activity.organization_name || 'Charity Platform',
    organization_description: activity.organization_description,
    contact_email: activity.contact_email,
    contact_phone: activity.contact_phone,
    website: activity.website,
    organization_address: activity.organization_address,
    registration_deadline: activity.registration_deadline,
    expirationtime: activity.expirationtime ? 
      (typeof activity.expirationtime === 'number' ? 
        new Date(activity.expirationtime * 1000).toISOString().slice(0, 19).replace('T', ' ') : 
        activity.expirationtime.toString()) : 
      undefined
  }
}

// API服务类
export class CharityApiService {
  
  // 检查API健康状态
  static async checkHealth(): Promise<ApiResponse<any>> {
    return apiRequest('/health')
  }

  // 获取所有可用活动（首页数据）
  static async getEvents(): Promise<ApiResponse<CharityEvent[]>> {
    // 使用PHP后端API接口
    // 首页需要展示所有活动（包含已过期），传入 compare_time=0 以取消过期过滤
    const response = await apiRequest<Activity[]>('/activity/getActivity?compare_time=0')
    
    // 转换数据格式
    if (response && response.data && Array.isArray(response.data)) {
      const charityEvents = response.data.map(convertActivityToCharityEvent)
      return {
        success: true,
        code: 200,
        msg: 'success',
        data: charityEvents,
        total: charityEvents.length
      }
    }
    
    return {
      success: false,
      code: 500,
      msg: 'Failed to get events data',
      message: 'Failed to get events data'
    } as any
  }

  // Get specific event details
  static async getEventById(id: number): Promise<ApiResponse<CharityEvent>> {
    // 使用新的PHP API接口获取所有活动，然后筛选特定ID的活动
    // 详情页也需要支持访问已过期的活动，保持与首页一致
    const response = await apiRequest<Activity[]>('/activity/getActivity?compare_time=0')
    
    // 转换数据格式
    if ((response.code === 1 || response.code === 200) && response.data) {
      const activity = response.data.find(item => item.id === id)
      if (activity) {
        const convertedData = convertActivityToCharityEvent(activity)
        return {
          success: true,
          code: response.code,
          msg: response.msg,
          data: convertedData
        }
      } else {
        throw new Error('Specified event not found')
      }
    }
    
    return {
      success: false,
      code: response.code,
      msg: response.msg,
      message: response.msg || 'Failed to get event detail'
    } as any
  }

  // Search events
  static async searchEvents(params: SearchParams): Promise<ApiResponse<CharityEvent[]>> {
    // 使用新的PHP API接口
    const response = await apiRequest<Activity[]>('/activity/getActivity')
    
    // 转换数据格式并根据搜索参数筛选
    if ((response.code === 1 || response.code === 200) && response.data) {
      let filteredData = response.data
      
      // 根据搜索参数筛选数据
      if (params.location) {
        filteredData = filteredData.filter(item => 
          item.location.toLowerCase().includes(params.location!.toLowerCase())
        )
      }
      
      if (params.category) {
        filteredData = filteredData.filter(item => 
          item.category_name.toLowerCase().includes(String(params.category).toLowerCase())
        )
      }
      
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status)
      }
      
      const convertedData = filteredData.map(convertActivityToCharityEvent)
      return {
        success: true,
        code: response.code,
        msg: response.msg,
        data: convertedData,
        total: convertedData.length
      }
    }
    
    return {
      success: false,
      code: response.code,
      msg: response.msg,
      message: response.msg || 'Failed to search events'
    } as any
  }

  // 获取活动类别
  static async getCategories(): Promise<ApiResponse<EventCategory[]>> {
    // 暂时返回模拟数据，后续可以连接到真实的分类API
    return {
      code: 200,
      msg: 'success',
      data: [
        { id: 1, name: '教育支持', description: '支持教育事业的慈善活动' },
        { id: 2, name: '医疗救助', description: '提供医疗援助的慈善活动' },
        { id: 3, name: '灾害救援', description: '自然灾害救援慈善活动' },
        { id: 4, name: '环境保护', description: '环保主题慈善活动' },
        { id: 5, name: '动物保护', description: '关爱动物的慈善活动' }
      ]
    }
  }

  // 获取地点列表
  static async getLocations(): Promise<ApiResponse<string[]>> {
    // 使用新的PHP API接口获取活动数据，然后提取唯一地点
    const response = await apiRequest<Activity[]>('/activity/getActivity')
    
    if ((response.code === 1 || response.code === 200) && response.data) {
      const locations = [...new Set(response.data.map(item => item.location))]
      return {
        success: true,
        code: response.code,
        msg: response.msg,
        data: locations,
        total: locations.length
      }
    }
    
    return {
      success: true,
      code: 200,
      msg: 'success',
      data: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安']
    }
  }

  // Get organization list - removed
  // static async getOrganizations(): Promise<ApiResponse<Organization[]>> {
  //   // 暂时返回模拟数据，后续可以连接到真实的机构API
  //   return {
  //     code: 200,
  //     msg: 'success',
  //     data: []
  //   }
  // }

  // Mock event registration
  static async registerForEvent(eventId: number, registrationData: any): Promise<ApiResponse<any>> {
    // Call Node backend API to update participant count and amount raised
    const nodeUrl = 'http://localhost:5051/api/activity/register'
    const response = await fetch(nodeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_id: eventId, ...registrationData })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  }
}

// Utility functions

// Format date display
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai'
  }
  
  return date.toLocaleDateString('en-US', options)
}

// Format expiration time display - keep backend format YYYY-MM-DD HH:MM:SS
export function formatExpirationTime(expirationTime: string | undefined): string {
  if (!expirationTime) {
    return 'Not set'
  }
  
  // If already in YYYY-MM-DD HH:MM:SS format, return directly
  if (typeof expirationTime === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(expirationTime)) {
    return expirationTime
  }
  
  // Try parsing other formats and convert to YYYY-MM-DD HH:MM:SS
  try {
    const date = new Date(expirationTime)
    if (isNaN(date.getTime())) {
      return expirationTime // If unable to parse, return original value
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return expirationTime // Return original value on error
  }
}

// Format amount display
export function formatAmount(amount: number, currencyType: string = 'CNY'): string {
  const n = Number(amount)
  if (!isFinite(n) || isNaN(n)) {
    return getCurrencySymbol(currencyType) + '0'
  }
  
  const formattedNumber = n.toLocaleString('en-US')
  return getCurrencySymbol(currencyType) + formattedNumber
}

// Get currency symbol
export function getCurrencySymbol(currencyType: string): string {
  const currencySymbols: Record<string, string> = {
    'CNY': '¥',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  }
  return currencySymbols[currencyType] || '¥'
}

// Calculate fundraising progress percentage
export function getProgressPercentage(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min((current / target) * 100, 100)
}

// Get event status display text
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'upcoming': 'Upcoming',
    'ongoing': 'Ongoing',
    'ended': 'Ended',
    'suspended': 'Suspended'
  }
  return statusMap[status] || status
}

// Get event status CSS class
export function getStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    'upcoming': 'status-upcoming',
    'ongoing': 'status-ongoing', 
    'ended': 'status-ended',
    'suspended': 'status-suspended'
  }
  return classMap[status] || ''
}

// Determine if event can be registered
export function canRegister(event: CharityEvent): boolean {
  const now = new Date()
  const eventDate = new Date(event.event_date)
  const registrationDeadline = event.registration_deadline ? new Date(event.registration_deadline) : eventDate
  
  return event.status === 'upcoming' && 
         now < registrationDeadline && 
         (!event.max_participants || event.current_participants < event.max_participants)
}

// Error handling utility
export function handleApiError(error: any): string {
  if (error?.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Request failed, please try again later'
}