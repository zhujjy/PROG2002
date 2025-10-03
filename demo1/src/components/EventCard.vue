<template>
  <div class="event-card" @click="handleCardClick">

    <div class="card-header">
      <div class="card-image">
        <img :src="getEventImage()" :alt="eventData.title" />
        <div class="image-overlay">
          <div class="event-status" :class="getStatusClass()">
            {{ getStatusText() }}
          </div>
        </div>
      </div>
    </div>


    <div class="card-content">
      <div class="card-title">
        <h3>{{ eventData.title }}</h3>
      </div>
      
      <div class="card-subtitle" v-if="eventData.subtitle">
        <p>{{ eventData.subtitle }}</p>
      </div>


      <div class="card-meta">
        <div class="meta-item">
          <i class="icon">📅</i>
          <span class="meta-label">Created</span>
          <span class="meta-value">{{ formatDate(eventData.createtime) }}</span>
        </div>
        
        <div class="meta-item" v-if="eventData.expirationtime">
          <i class="icon">⏰</i>
          <span class="meta-label">Deadline</span>
          <span class="meta-value">{{ formatDate(eventData.expirationtime) }}</span>
        </div>
      </div>


      <div class="card-actions">
        <button 
          @click.stop="handleViewDetail" 
          class="action-btn primary"
          :disabled="!canViewDetail"
        >
          View Details
        </button>
        
        <button 
          @click.stop="handleParticipate" 
          class="action-btn secondary"
          v-if="canParticipate"
        >
          Join Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'


interface EventData {
  id: number
  background_image: string
  title: string
  subtitle: string
  article_detail_id: number
  status: string
  createtime: number
  updatetime: number
  expirationtime: string
  deletetime: string | null
  status_text: string
}

interface Props {
  eventData: EventData
  clickable?: boolean
  showActions?: boolean
}

interface Emits {
  (e: 'click', eventData: EventData): void
  (e: 'view-detail', eventData: EventData): void
  (e: 'participate', eventData: EventData): void
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  showActions: true
})

const emit = defineEmits<Emits>()
const router = useRouter()


const currentTime = ref(new Date())
let timeUpdateInterval: number | null = null

const canViewDetail = computed(() => {
  return props.eventData.article_detail_id && props.eventData.article_detail_id > 0
})

const canParticipate = computed(() => {
  return props.eventData.status === 'normal' && !isExpired.value
})


const isExpired = computed(() => {
  if (!props.eventData.expirationtime) return false
  
  try {

    let expirationDate: Date
    

    const timeString = props.eventData.expirationtime.trim()
    
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
      console.warn(`Invalid expiration time: ${props.eventData.expirationtime}`)
      return false
    }

    return currentTime.value.getTime() > expirationDate.getTime()
  } catch (error) {
    console.error('Error parsing expiration time:', error)
    return false
  }
})


function getStatusClass(): string {

  if (props.eventData.status_text) {
    return 'status-custom'
  }
  
  switch (props.eventData.status) {
    case 'normal':
      return isExpired.value ? 'status-expired' : 'status-active'
    case 'hidden':
      return 'status-hidden'
    default:
      return 'status-unknown'
  }
}

// Get event status text - dynamic display based on time comparison
function getStatusText(): string {
  // Prefer backend-provided custom status text
  if (props.eventData.status_text) {
    return props.eventData.status_text
  }
  
  // Determine based on event status and time comparison
  switch (props.eventData.status) {
    case 'normal':
      if (isExpired.value) {
        return 'Ended'  // current time > expirationtime
      } else {
        return 'Upcoming'  // 当前时间 ≤ expirationtime
      }
    case 'hidden':
      return 'Hidden'
    default:
      return 'Unknown Status'
  }
}

// Start real-time time update
function startTimeUpdate() {
  // Update current time every second to reflect status changes immediately in UI
  timeUpdateInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
}

// Stop real-time time update
function stopTimeUpdate() {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
}

// Lifecycle hooks
onMounted(() => {
  startTimeUpdate()
})

onUnmounted(() => {
  stopTimeUpdate()
})

// Methods
function getEventImage(): string {
  if (props.eventData.background_image) {
    return props.eventData.background_image
  }
  // Use a random image as default background
  return `https://picsum.photos/400/250?random=${props.eventData.id}`
}

function formatDate(timestamp: number | string): string {
  let date: Date
  
  if (typeof timestamp === 'number') {
    // Unix时间戳（秒）
    date = new Date(timestamp * 1000)
  } else {
    // 字符串格式的日期
    date = new Date(timestamp)
  }
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleCardClick() {
  if (props.clickable) {
    emit('click', props.eventData)
  }
}

function handleViewDetail() {
  if (canViewDetail.value) {
    emit('view-detail', props.eventData)

    if (props.eventData.article_detail_id) {
      router.push(`/event/${props.eventData.article_detail_id}`)
    }
  }
}

function handleParticipate() {
  if (canParticipate.value) {
    emit('participate', props.eventData)
  }
}
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}


.card-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .card-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.2) 100%
  );
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 1rem;
}

.event-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-active {
  background: rgba(34, 197, 94, 0.9);
}

.status-expired {
  background: rgba(239, 68, 68, 0.9);
}

.status-hidden {
  background: rgba(107, 114, 128, 0.9);
}

.status-unknown {
  background: rgba(156, 163, 175, 0.9);
}


.card-content {
  padding: 1.5rem;
}

.card-title h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-subtitle p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-item .icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.meta-label {
  color: #6b7280;
  min-width: 60px;
}

.meta-value {
  color: #374151;
  font-weight: 500;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 100px;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .card-header {
    height: 160px;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .card-title h3 {
    font-size: 1.1rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    flex: none;
  }
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-card {
  animation: fadeInUp 0.6s ease-out;
}
</style>