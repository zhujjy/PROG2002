<template>
  <div class="search-page">
    <!-- Page Header -->
    <section class="page-header">
      <h1 class="page-title">🔍 Search Charity Events</h1>
      <p class="page-subtitle">Filter and find charity events that suit your needs</p>
    </section>

    <!-- Search form area -->
    <section class="search-form-section">
      <div class="search-form-container">
        <form @submit.prevent="handleSearch" class="search-form">
          <div class="form-row">
            <!-- Date Filter -->
            <div class="form-group">
              <label>📅 Event Date</label>
              <Datepicker 
                v-model="searchForm.date"
                :min-date="new Date()"
                :enable-time="false"
                :format="formatDatePicker"
                :locale="'en'"
                :teleport="true"
                :z-index="5000"
                input-class="form-control"
              />
            </div>

            <!-- Location Filter -->
            <div class="form-group">
              <label for="location">📍 Location</label>
              <input 
                type="text" 
                id="location" 
                v-model="searchForm.location"
                class="form-control"
                placeholder="Enter a city or address"
                list="location-suggestions"
              />
              <datalist id="location-suggestions">
                <option v-for="location in locations" :key="location" :value="location" />
              </datalist>
            </div>

            <!-- Category Filter -->
            <div class="form-group">
              <label for="category">🏷️ Event Category</label>
              <input 
                type="text" 
                id="category" 
                v-model="searchForm.category"
                class="form-control"
                placeholder="Enter event category"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="search-btn" :disabled="searching">
              <span v-if="searching">🔄 Searching...</span>
              <span v-else>🔍 Search Events</span>
            </button>
            <button type="button" @click="clearFilters" class="clear-btn">
              🧹 Clear Filters
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Search Results Area -->
    <section class="search-results-section">
      <!-- Search Status Info -->
      <div v-if="hasSearched" class="search-info">
        <h3 class="results-title">
          {{ searching ? 'Searching...' : `Found ${searchResults.length} related events` }}
        </h3>
        <div v-if="!searching && hasActiveFilters" class="active-filters">
          <span class="filter-label">Active filters:</span>
          <span v-if="searchForm.date" class="filter-tag">
            📅 {{ formatEventDate(searchForm.date) }}
            <button @click="searchForm.date = ''" class="remove-filter">×</button>
          </span>
          <span v-if="searchForm.location" class="filter-tag">
            📍 {{ searchForm.location }}
            <button @click="searchForm.location = ''" class="remove-filter">×</button>
          </span>
          <span v-if="searchForm.category" class="filter-tag">
            🏷️ {{ searchForm.category }}
            <button @click="searchForm.category = ''" class="remove-filter">×</button>
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="searching" class="loading">
        <div class="loading-spinner"></div>
        <p>Searching events...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>😟 {{ error }}</p>
        <button @click="handleSearch" class="retry-btn">Search Again</button>
      </div>

      <!-- Results List -->
      <div v-else-if="hasSearched && searchResults.length > 0" class="results-grid">
        <div 
          v-for="(event, index) in searchResults" 
          :key="event.id" 
          class="result-card"
          :style="{ '--delay': index * 0.1 + 's' }"
          @click="goToEvent(event.id)"
        >
          <div class="result-image">
            <img :src="getEventImage(event)" :alt="event.name" />
            <div class="result-status" :class="getDynamicStatusClass(event)">
              {{ getDynamicStatusText(event) }}
            </div>
          </div>
          
          <div class="result-content">
            <h4 class="result-title">{{ event.name }}</h4>
            <p class="result-description">{{ event.description }}</p>
            
            <div class="result-details">
              <div class="detail-row">
                <span class="detail-icon">📅</span>
                <span>{{ formatEventDate(event.event_date) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">📍</span>
                <span>{{ event.location }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">🏷️</span>
                <span>{{ event.category_name }}</span>
              </div>
            </div>
            
            <div class="result-progress">
              <div class="progress-info">
                <span v-if="event.current_amount != null" class="current">{{ formatAmount(event.current_amount, event.currency_type) }}</span>
                <span class="target">/ {{ formatAmount(event.target_amount || 0, event.currency_type) }}</span>
              </div>
              <div v-if="event.current_amount != null && event.target_amount" class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressPercentage(event.current_amount, event.target_amount) + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="result-footer">
              <div class="price">
                <span v-if="event.is_free" class="free">Free</span>
                <span v-else class="paid">Ticket {{ formatAmount(event.ticket_price, event.currency_type) }}</span>
              </div>
              <div class="participants">
                👥 {{ event.current_participants }} participants
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="hasSearched && searchResults.length === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No matching events found</h3>
        <p>Try adjusting filters or browse other events</p>
        <router-link to="/" class="back-home-btn">Back to Home</router-link>
      </div>

      <!-- Initial Prompt -->
      <div v-else class="search-prompt">
        <div class="prompt-icon">🎯</div>
        <h3>Start searching charity events</h3>
        <p>Use the search form above to find events that match your needs</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  CharityApiService, 
  formatEventDate, 
  formatAmount, 
  getProgressPercentage,
  getStatusText,
  getStatusClass,
  handleApiError
} from '@/services/api'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const router = useRouter()

// Search form parameters 
type SearchForm = {
  date: string | Date
  location: string
  category: string 
}

const searchForm = reactive<SearchForm>({
  date: '',
  location: '',
  category: ''
})

// Interface return results are mapped to front-end display structures 
type ArticleSearchItem = {
  id: number
  name: string
  description: string
  event_date: number | string
  location: string | null
  category_name: string | null
  image_url: string | null
  currency_type: string | null
  target_amount: number | null
  status: string | null
}

const searchResults = ref<ArticleSearchItem[]>([])
const locations = ref<string[]>([])
const searching = ref(false)
const error = ref('')
const hasSearched = ref(false)

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(searchForm.date || searchForm.location || searchForm.category)
})

// 当日期变化时自动触发搜索，避免用户只选择日期却没有点击“Search”导致前台无数据
watch(() => searchForm.date, async (val) => {
  if (!val) return
  try {
    await handleSearch()
  } catch (e) {
    // 具体错误在 handleSearch 中已处理到 error 状态
  }
})

// Load basic data
async function loadBasicData() {
  try {
    const locationsResponse = await CharityApiService.getLocations()
    if (locationsResponse.success && locationsResponse.data) {
      locations.value = locationsResponse.data
    }
  } catch (err) {
    console.error('Failed to load basic data:', err)
  }
}

// Build search request
function buildArticleSearchUrl(base: string, params: SearchForm): string {
  const query: Record<string, string> = {}
  // Convert UI date to backend 'createtime' (seconds timestamp)
  if (params.date) {
    const dateObj = params.date instanceof Date ? params.date : new Date(params.date)
    const ts = Math.floor(dateObj.getTime() / 1000)
    query.createtime = String(ts)
  }
  if (params.location) {
    query.location = params.location.trim()
  }
  if (params.category) {
    // Reuse 'category' as backend 'tag' parameter
    query.tag = String(params.category).trim()
  }
  const qs = new URLSearchParams(query).toString()
  return qs ? `${base}?${qs}` : base
}

async function searchArticles(params: SearchForm) {
  // Use relative path and route via Vite proxy to backend
  const url = buildArticleSearchUrl('/api/active/article/search', params)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const json = await res.json()
  if (json.code !== 1) throw new Error(json.msg || 'API response error')
  const list = (json.data && Array.isArray(json.data.list)) ? json.data.list : []
  
  // Map data (date filtering handled by backend: selected time < expiration time)
  const mappedList = list.map((item: any) => ({
    id: item.activity_id ?? item.article_id ?? item.Id ?? item.id ?? 0,
    name: item.title ?? 'Untitled Event',
    description: item.subtitle ?? '',
    event_date: item.expirationtime ?? item.createtime ?? '',
    location: item.location ?? null,
    category_name: item.Tag ?? null,
    image_url: item.background_image ?? null,
    currency_type: item.currency_type ?? null,
    target_amount: item.target_amount ?? null,
    status: item.status ?? null,
  })) as ArticleSearchItem[]
  
  // Return backend-filtered results to avoid strict same-day frontend filtering
  return mappedList
}

// 处理搜索
async function handleSearch() {
  searching.value = true
  error.value = ''
  hasSearched.value = true
  
  try {
    // 验证搜索参数
    if (!hasActiveFilters.value) {
      throw new Error('Please select at least one filter')
    }
    
    const data = await searchArticles(searchForm)
    searchResults.value = data
    
    // 如果没有结果，提供友好提示
    if (data.length === 0) {
      error.value = 'No events matched your filters. Try adjusting them.'
    }
  } catch (err) {
    error.value = handleApiError(err)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

function clearFilters() {
  searchForm.date = ''
  searchForm.location = ''
  searchForm.category = ''
  searchResults.value = []
  hasSearched.value = false
  error.value = ''
}

function goToEvent(eventId: number) {
  router.push(`/event/${eventId}`)
}

function getEventImage(event: ArticleSearchItem): string {
  try {

    if (event.image_url) {

      return event.image_url
    }
    
    // 使用随机图片作为后备
    return `https://picsum.photos/300/200?random=${event.id}`
  } catch (error) {
    console.error('Image URL processing error:', error)
    return `https://picsum.photos/300/200?random=${event.id || Math.random()}`
  }
}


function formatEventDate(dateValue: string | number | Date): string {
  try {
    let date: Date
    
    if (dateValue instanceof Date) {
      date = dateValue
    } else if (typeof dateValue === 'number') {
      // 如果是秒级时间戳，转换为毫秒级
      const timestamp = dateValue < 10000000000 ? dateValue * 1000 : dateValue
      date = new Date(timestamp)
    } else {

      date = new Date(dateValue)
    }

    if (isNaN(date.getTime())) {
      return 'Invalid date format'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date format'
  }
}

// Datepicker input display in English YYYY-MM-DD
function formatDatePicker(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}


function isSameDate(userInputDate: string, eventDate: string | number): boolean {
  try {

    if (!userInputDate) {
      return true
    }
    

    const userDate = new Date(userInputDate)
    if (isNaN(userDate.getTime())) {
      return true 
    }
    

    let eventDateObj: Date
    if (typeof eventDate === 'number') {

      const timestamp = eventDate < 10000000000 ? eventDate * 1000 : eventDate
      eventDateObj = new Date(timestamp)
    } else {
      eventDateObj = new Date(eventDate)
    }
    
    if (isNaN(eventDateObj.getTime())) {
      return true 
    }

    return userDate.getFullYear() === eventDateObj.getFullYear() &&
           userDate.getMonth() === eventDateObj.getMonth() &&
           userDate.getDate() === eventDateObj.getDate()
  } catch (error) {
    console.error('日期比较错误:', error)
    return true 
  }
}


const currentTime = ref(new Date())
let timeUpdateInterval: number | null = null

function startTimeUpdate() {
  
  timeUpdateInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
}


function stopTimeUpdate() {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
}


function isEventExpired(expirationtime: string | undefined): boolean {
  if (!expirationtime) return false
  
  try {

    let expirationDate: Date
    

    const timeString = expirationtime.trim()
    
    if (timeString.includes('T') || timeString.includes('Z') || timeString.includes('+') || timeString.includes('-')) {

      expirationDate = new Date(timeString)
    } else {

      const isoString = timeString.replace(' ', 'T')
      expirationDate = new Date(isoString)
      

      if (isNaN(expirationDate.getTime())) {
        expirationDate = new Date(timeString)
      }
    }
    

    if (isNaN(expirationDate.getTime())) {
      console.warn(`Invalid expiration time: ${expirationtime}`)
      return false
    }
    

    return currentTime.value.getTime() > expirationDate.getTime()
  } catch (error) {
    console.error('Error parsing expiration time:', error)
    return false
  }
}


function getDynamicStatusText(event: ArticleSearchItem): string {

  if (event.event_date) {

    const expirationtime = typeof event.event_date === 'number' 
      ? new Date(event.event_date * 1000).toISOString()
      : event.event_date.toString()
    
    if (isEventExpired(expirationtime)) {
      return 'Ended'  // Current time > expirationtime
    } else {
      return 'Upcoming'  // Current time ≤ expirationtime
    }
  }
  

  return getStatusText(event.status)
}


function getDynamicStatusClass(event: ArticleSearchItem): string {

  if (event.event_date) {

    const expirationtime = typeof event.event_date === 'number' 
      ? new Date(event.event_date * 1000).toISOString()
      : event.event_date.toString()
    
    if (isEventExpired(expirationtime)) {
      return 'status-ended'  // EndedStyle
    } else {
      return 'status-upcoming'  // UpcomingStyle
    }
  }
  

  return getStatusClass(event.status)
}

// ... existing code ...


onMounted(() => {
  loadBasicData()

  startTimeUpdate()
})


onUnmounted(() => {

  stopTimeUpdate()
})
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}


/* Page header */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease-out;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

/* Page subtitle */
.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Search form */
.search-form-section {
  margin-bottom: 3rem;
  position: relative;
  z-index: 10;
}

.search-form-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  animation: slideUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-control:focus {
  outline: none;
  border-color: #42b883;
  background: white;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.search-btn, .clear-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.search-btn {
  background: linear-gradient(45deg, #42b883, #369870);
  color: white;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.clear-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.clear-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

/* Search results */
.search-results-section {
  animation: fadeInUp 0.8s ease-out 0.4s both;
  position: relative;
  z-index: 1;
}

.search-info {
  margin-bottom: 2rem;
}

.results-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  color: #666;
  font-weight: 500;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #42b883, #369870);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.remove-filter {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-filter:hover {
  background: rgba(255,255,255,0.2);
}

/* Loading and error state */
.loading {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
  color: #e74c3c;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Search results grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.result-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: cardSlideUp 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
}

@keyframes cardSlideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.result-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.result-card:hover .result-image img {
  transform: scale(1.05);
}

.result-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  backdrop-filter: blur(10px);
}

.result-content {
  padding: 1.5rem;
}

.result-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
}

.result-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
}

.result-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.detail-icon {
  font-size: 1rem;
}

.result-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.current {
  color: #42b883;
  font-weight: 600;
}

.target {
  color: #666;
}

.progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #42b883, #369870);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.free {
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.paid {
  color: #e74c3c;
  font-weight: 600;
}

.participants {
  color: #666;
}

/* Status styles */
.status-upcoming { background: rgba(52, 152, 219, 0.9); }
.status-ongoing { background: rgba(46, 204, 113, 0.9); }
.status-ended { background: rgba(149, 165, 166, 0.9); }
.status-suspended { background: rgba(231, 76, 60, 0.9); }

/* Empty state */
.no-results, .search-prompt {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.no-results-icon, .prompt-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-results h3, .search-prompt h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #555;
}

.back-home-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(45deg, #42b883, #369870);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .search-form-container {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .search-btn, .clear-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .search-form-container {
    padding: 1rem;
  }
  
  .result-content {
    padding: 1rem;
  }
}
/* Keep Datepicker dropdown above other sections */
:deep(.dp__menu) {
  z-index: 5000 !important;
}
:deep(.dp__overlay) {
  z-index: 4999 !important;
}
</style>
