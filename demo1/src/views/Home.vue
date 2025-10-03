<template>
  <div class="home">
    <!-- Home page banner -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
          <div class="shape shape-5"></div>
        </div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title dynamic-text">Charitable Activities 💝</h1>
        <p class="hero-subtitle morph-text">Join us in spreading warmth and changing the world</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number stat-events" :data-final="totalEvents">{{ totalEvents }}</span>
            <span class="stat-label">Total number of activities</span>
          </div>
          <div class="stat-item">
            <span class="stat-number stat-raised" :data-final="formatAmount(totalRaised, mainCurrencyType)">{{ formatAmount(totalRaised, mainCurrencyType) }}</span>
            <span class="stat-label">Raised money</span>
          </div>
          <div class="stat-item">
            <span class="stat-number stat-participants" :data-final="totalParticipants">{{ totalParticipants }}</span>
            <span class="stat-label">Number of participants</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Events Section -->
    <section class="events-section animate-fade-up">
      <div class="section-header animate-fade-up">
        <h2 class="section-title enhanced-text">Popular charity activities</h2>
        <p class="section-subtitle typewriter-text">Every love can light up the light of hope </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading event information...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <p>😔 {{ error }}</p>
        <button @click="loadEvents" class="retry-btn">Retry</button>
      </div>

      <!-- Event Cards List -->
      <div v-else class="events-grid">
        <div 
          v-for="(event, index) in events" 
          :key="event.id" 
          class="event-card animate-fade-up"
          :style="{ '--delay': index * 0.1 + 's' }"
          @click="goToEvent(event.id)"
        >
          <div class="event-image">
            <img :src="getEventImage(event)" :alt="event.name" />
            <div class="event-status" :class="getDynamicStatusClass(event)">
              {{ getDynamicStatusText(event) }}
            </div>
            <div class="event-category">{{ event.category_name }}</div>
          </div>
          
          <div class="event-content">
            <h3 class="event-title">{{ event.name }}</h3>
            <p class="event-description">{{ event.description }}</p>
            
            <div class="event-details">
              <div class="detail-item">
                <i class="icon">📅</i>
                <span>{{ formatExpirationTime(event.expirationtime) }}</span>
              </div>
              <div class="detail-item">
                <i class="icon">📍</i>
                <span>{{ event.location }}</span>
              </div>
              <div class="detail-item">
                <i class="icon">🏢</i>
                <span>World Charity United Foundation</span>
              </div>
            </div>
            
            <div class="event-progress">
              <div class="progress-info">
                <span class="current-amount">Raised {{ formatAmount(event.current_amount, event.currency_type) }}</span>
                <span class="target-amount">Target {{ formatAmount(event.target_amount, event.currency_type) }}</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressPercentage(event.current_amount, event.target_amount) + '%' }"
                ></div>
              </div>
              <div class="progress-percentage">
                {{ getProgressPercentage(event.current_amount, event.target_amount).toFixed(1) }}%
              </div>
            </div>
            
            <div class="event-footer">
              <div class="price-info">
                <span v-if="event.is_free" class="free-event">Free</span>
                <span v-else class="ticket-price">Ticket {{ formatAmount(event.ticket_price, event.currency_type) }}</span>
              </div>
              <div class="participants">
                <i class="icon">👥</i>
                <span>{{ event.current_participants }} participants</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && events.length === 0" class="empty">
        <div class="empty-icon">🌱</div>
        <h3>No events</h3>
        <p>No available charity events at the moment. Please check back later.</p>
      </div>

      <!-- View More Button -->
      <div v-if="events.length > 0" class="more-events">
        <router-link to="/search" class="more-btn">
          🔍 Search More Events
        </router-link>
      </div>
    </section>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { gsap } from 'gsap'
import { useGSAPAnimations } from '@/composables/useGSAPAnimations'
import { useRouter } from 'vue-router'
import { 
  CharityApiService, 
  type CharityEvent,
  formatEventDate, 
  formatExpirationTime,
  formatAmount, 
  getProgressPercentage,
  getStatusText,
  getStatusClass,
  handleApiError
} from '@/services/api'

const router = useRouter()


const events = ref<CharityEvent[]>([])
const loading = ref(false)
const error = ref('')


const currentTime = ref(new Date())
let timeUpdateInterval: number | null = null


const totalEvents = computed(() => events.value.length)
const totalRaised = computed(() => 
  events.value.reduce((sum, event) => sum + event.current_amount, 0)
)
const totalParticipants = computed(() => 
  events.value.reduce((sum, event) => sum + event.current_participants, 0)
)


const mainCurrencyType = computed(() => {
  if (events.value.length === 0) return 'USD'
  

  const currencyCount: Record<string, number> = {}
  events.value.forEach(event => {
    const currency = event.currency_type || 'USD'
    currencyCount[currency] = (currencyCount[currency] || 0) + 1
  })
  
  return Object.keys(currencyCount).reduce((a, b) => 
    currencyCount[a] > currencyCount[b] ? a : b
  )
})

// Load events data
async function loadEvents() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await CharityApiService.getEvents()
    
    if (response.success && response.data) {
      events.value = response.data
    } else {
      throw new Error(response.message || 'Failed to fetch events')
    }
  } catch (err) {
    error.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}



// Navigate to event detail page
function goToEvent(eventId: number) {
  router.push(`/event/${eventId}`)
}

// Get event image (use placeholder if missing)
function getEventImage(event: CharityEvent): string {
  return event.image_url || `https://picsum.photos/400/250?random=${event.id}`
}



// Start real-time time update
function startTimeUpdate() {
  // Update current time every second to reflect status immediately
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

// Enhanced time comparison logic - handle timezone differences for accuracy
function isEventExpired(expirationtime: string | undefined): boolean {
  if (!expirationtime) return false
  
  try {
    // Handle timezone differences for accurate comparison
    let expirationDate: Date
    
    // Check time string format; assume local timezone if missing
    const timeString = expirationtime.trim()
    
    if (timeString.includes('T') || timeString.includes('Z') || timeString.includes('+') || timeString.includes('-')) {
      // ISO format with timezone info or offset
      expirationDate = new Date(timeString)
    } else {
      // Format without timezone info (e.g., "2025-10-09 17:47:28"), assume local timezone
      // Convert to ISO format for proper parsing
      const isoString = timeString.replace(' ', 'T')
      expirationDate = new Date(isoString)
      
      // If parsing fails, try parsing the original string
      if (isNaN(expirationDate.getTime())) {
        expirationDate = new Date(timeString)
      }
    }
    
    // Validate date
    if (isNaN(expirationDate.getTime())) {
      console.warn(`Invalid expiration time: ${expirationtime}`)
      return false
    }
    
    // Compare current time with expiration in real-time
    // Use millisecond precision to ensure accuracy
    return currentTime.value.getTime() > expirationDate.getTime()
  } catch (error) {
    console.error('Error parsing expiration time:', error)
    return false
  }
}

// Get dynamic status text based on time comparison
function getDynamicStatusText(event: CharityEvent): string {
  // If the event has expirationtime, use real-time comparison result
  if (event.expirationtime) {
    if (isEventExpired(event.expirationtime)) {
      return 'Ended'  // Current time > expirationtime
    } else {
      return 'Upcoming'  // Current time ≤ expirationtime
    }
  }
  
  // If no expirationtime, use original status logic
  return getStatusText(event.status)
}

// Get dynamic status class
function getDynamicStatusClass(event: CharityEvent): string {
  // If the event has expirationtime, return class based on comparison result
  if (event.expirationtime) {
    if (isEventExpired(event.expirationtime)) {
      return 'status-ended'  // EndedStyle
    } else {
      return 'status-upcoming'  // UpcomingStyle
    }
  }
  
  // If no expirationtime, use original status class
  return getStatusClass(event.status)
}
const {
    initAnimations,
    animateHero,
    createScrollAnimations,
    animateNumbers,
    splitTextAnimation,
    fadeInWords,
    addHoverAnimations,
    createAdvancedScrollEffects,
    createDynamicTextAnimation,
      createTextMorphAnimation,
      enhancedTypewriterEffect,
      enhanceHeroTextAnimations,
      createAdvancedTextAnimations,
      cleanup
  } = useGSAPAnimations()


onMounted(async () => {
  await loadEvents()
  

  startTimeUpdate()
  

  initAnimations()
  

  setTimeout(() => {

    animateHero()
    

    createScrollAnimations()
    

    enhanceHeroTextAnimations()
    

    const advancedAnimations = createAdvancedTextAnimations()
    

    createDynamicTextAnimation('.dynamic-text', ['Charitable Activities', 'Making a Difference', 'Spreading Kindness', 'Changing Lives Together❤'])

    createTextMorphAnimation('.morph-text')
    

    splitTextAnimation('.text-split')
    fadeInWords('.text-fade-words')
    

    animateNumbers('.stat-events', totalEvents.value)
    animateNumbers('.stat-participants', totalParticipants.value)
    

    addHoverAnimations()
    

    enhancedTypewriterEffect('.typewriter-text', 'Every act of kindness can light up hope', {
      speed: 0.08,
      cursor: true
    })
    

    createTextMorphAnimation('.enhanced-text')
    

    createAdvancedScrollEffects()
    

    setTimeout(() => {
      const heroTitle = document.querySelector('.hero-title')
      if (heroTitle) {

        gsap.set(heroTitle, { 
          opacity: 1, 
          visibility: 'visible', 
          zIndex: 15,
          display: 'block'
        })
        advancedAnimations.createTextExplosion('.hero-title')
      }
    }, 1000)
    
    setTimeout(() => {
      const heroSubtitle = document.querySelector('.hero-subtitle')
      if (heroSubtitle) {

        gsap.set(heroSubtitle, { 
          opacity: 1, 
          visibility: 'visible', 
          zIndex: 14,
          display: 'block'
        })
        advancedAnimations.createNeonEffect('.hero-subtitle')
      }
    }, 2000)
    
    setTimeout(() => {
    const enhancedText = document.querySelector('.enhanced-text')
    if (enhancedText) {

      gsap.set(enhancedText, { 
        opacity: 1, 
        visibility: 'visible', 
        zIndex: 13,
        display: 'inline-block'
      })
      advancedAnimations.createCharacterRain('.enhanced-text')
    }
  }, 3000)
}, 500)
})


onUnmounted(() => {

  stopTimeUpdate()
  cleanup()
})
</script>

<style scoped>
.home {
  max-width: 100%;
  margin: 0 auto;
}


.hero-section {
  position: relative;
  width: 100%;
  min-height: 100vh;
  color: rgb(113, 85, 85);
  padding: 1rem;
  text-align: center;
  border-radius: 0;
  margin: 0;
  margin-top: -200px;
  overflow: hidden;
  animation: slideUp 1s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  opacity: 0.1;
  filter: blur(1px);
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 15%;
  background: linear-gradient(45deg, #4ecdc4, #6ee5db);
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  background: linear-gradient(45deg, #45b7d1, #74c7ec);
}

.shape-4 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 25%;
  background: linear-gradient(45deg, #96ceb4, #b8e6d3);
}

.shape-5 {
  width: 70px;
  height: 70px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(45deg, #feca57, #fed766);
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

.hero-content {
  z-index: 1;
  max-width: 800px;
  width: 100%;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
  z-index: 15;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: titleGlow 2s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% { 
    filter: drop-shadow(0 0 5px rgba(102, 126, 234, 0.3));
    transform: scale(1);
  }
  100% { 
    filter: drop-shadow(0 0 20px rgba(118, 75, 162, 0.5));
    transform: scale(1.02);
  }
}

@keyframes shimmerFlow {
  0% {
    background-position: 0% 50%;
    background-size: 200% 200%;
  }
  100% {
    background-position: 100% 50%;
    background-size: 200% 200%;
  }
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 14;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: subtitleFloat 3s ease-in-out infinite;
}

@keyframes subtitleFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.stat-item {
  text-align: center;
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(190, 122, 48, 0.2);
  transition: transform 0.3s ease;
  min-width: 120px;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #4ecdc4;
  text-shadow: 1px 1px 2px rgba(130, 6, 6, 0.2);
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.5rem;
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

/* 活动区域样式 */
.events-section {
  margin-top: 3rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease-out;
}

.section-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  letter-spacing: 0.5px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
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

.retry-btn:hover {
  background: #369870;
  transform: translateY(-2px);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.event-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: cardFadeIn 0.6s ease-out calc(var(--delay));
  animation-fill-mode: both;
}

@keyframes cardFadeIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.event-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.event-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.05);
}

.event-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  backdrop-filter: blur(10px);
}

.status-upcoming {
  background: rgba(52, 152, 219, 0.9);
}

.status-ongoing {
  background: rgba(46, 204, 113, 0.9);
}

.status-ended {
  background: rgba(149, 165, 166, 0.9);
}

.status-suspended {
  background: rgba(231, 76, 60, 0.9);
}

.event-category {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.event-content {
  padding: 1.5rem;
}

.event-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
}

.event-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.detail-item .icon {
  font-size: 1rem;
}

.event-progress {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.current-amount {
  color: #42b883;
  font-weight: 600;
}

.target-amount {
  color: #666;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #42b883, #369870);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-percentage {
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.price-info {
  font-weight: 600;
}

.free-event {
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.ticket-price {
  color: #e74c3c;
  font-size: 1.1rem;
}

.participants {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
  font-size: 0.9rem;
}

.empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}


.more-events {
  text-align: center;
  margin-top: 3rem;
}

.more-btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #42b883, #369870);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
}

.more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}


.rain-char,
.explode-char {
  display: inline-block !important;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: inherit;
}

.typewriter-cursor {
  color: #4ecdc4;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}


.hero-title .char,
  .hero-subtitle .char {
    display: inline-block;
    transform-style: preserve-3d;
    perspective: 1000px;
    z-index: inherit;
  }

.hero-title .char {
  margin: 0 1px;
}

.hero-subtitle .char {
  margin: 0 0.5px;
}

.enhanced-text {
  position: relative;
  display: inline-block !important;
  z-index: 13;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease-in-out infinite;
  visibility: visible !important;
  opacity: 1 !important;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.typewriter-text {
  position: relative;
  display: inline-block;
  min-height: 1.2em;
}


.dynamic-text {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.morph-text {
  position: relative;
  display: inline-block;
}

.morph-text span {
  transition: all 0.3s ease;
}


@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typewriter-cursor {
  color: #00ff88;
  font-weight: bold;
  animation: blink 1s infinite;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-stats {
    gap: 1rem;
  }
  
  .stat-item {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 1.8rem;
  }
  
  .event-content {
    padding: 1rem;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
}



</style>