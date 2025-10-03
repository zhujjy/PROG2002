<template>
  <div class="event-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading event details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <h2>😞 Load Failed</h2>
      <p>{{ error }}</p>
      <button @click="loadEventDetail" class="retry-btn">Reload</button>
      <router-link to="/" class="back-btn">Back to Home</router-link>
    </div>

    <!-- Event Detail Content -->
    <div v-else-if="event" class="event-content">
      <!-- Back Button -->
      <div class="breadcrumb">
        <button @click="goBack" class="back-link">
          ← Back
        </button>
      </div>

      <!-- Event Main Image and Basic Info -->
      <section class="event-hero">
        <div class="hero-image">
          <img :src="getEventImage(event)" :alt="event.name" />
          <div class="hero-overlay">
            <div class="event-status" :class="getStatusClass(event.status)">
              {{ getStatusText(event.status) }}
            </div>
            <div class="event-category">{{ event.category_name }}</div>
          </div>
        </div>
        
        <div class="hero-content">
          <h1 class="event-title">{{ event.name }}</h1>
          <p class="event-organization">
            🏢 Hosted by <strong>{{ event.organization_name }}</strong>
          </p>
          
          <div class="event-meta">
            <div class="meta-item">
              <i class="icon">📅</i>
              <div>
                <span class="meta-label">Event Date</span>
                <span class="meta-value">{{ formatEventDate(event.event_date) }}</span>
              </div>
            </div>
            <div class="meta-item">
              <i class="icon">📍</i>
              <div>
                <span class="meta-label">Location</span>
                <span class="meta-value">{{ event.location }}</span>
              </div>
            </div>
            <div class="meta-item">
              <i class="icon">🎫</i>
              <div>
                <span class="meta-label">Ticket Price</span>
                <span class="meta-value">
                  {{ event.is_free ? 'Free' : formatAmount(event.ticket_price, event.currency_type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Fundraising Progress -->
      <section class="fundraising-section">
        <div class="fundraising-card">
          <h3 class="card-title">💰 Fundraising Progress</h3>
          <div class="fundraising-stats">
            <div class="stat-item">
              <span class="stat-label">Raised</span>
              <span class="stat-value current-amount">{{ formatAmount(event.current_amount, event.currency_type) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Target</span>
              <span class="stat-value target-amount">{{ formatAmount(event.target_amount, event.currency_type) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Completion</span>
              <span class="stat-value percentage">{{ progressPercentage.toFixed(1) }}%</span>
            </div>
          </div>
          
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
          
          <div class="participants-info">
            <i class="icon">👥</i>
            <span>Currently joined by <strong>{{ event.current_participants }}</strong> participants</span>
            <span v-if="event.max_participants" class="max-participants">
              (Max {{ event.max_participants }} people)
            </span>
          </div>
        </div>
      </section>

      <!-- Event Details -->
      <section class="description-section">
        <div class="description-card">
          <h3 class="card-title">📝 Event Details</h3>
          <div class="description-content">
            <p v-if="event.full_description" class="full-description">
              {{ event.full_description }}
            </p>
            <p v-else class="description">
              {{ event.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- Organization Information -->
      <section class="organization-section">
        <div class="organization-card">
          <h3 class="card-title">🏢 Organizer</h3>
          <div class="organization-info">
            <h4 class="org-name">{{ event.organization_name }}</h4>
            <p v-if="event.organization_description" class="org-description">
              {{ event.organization_description }}
            </p>
            
            <div class="contact-info" v-if="hasContactInfo">
              <h5>Contact</h5>
              <div v-if="event.contact_email" class="contact-item">
                <i class="icon">📧</i>
                <a :href="`mailto:${event.contact_email}`">{{ event.contact_email }}</a>
              </div>
              <div v-if="event.contact_phone" class="contact-item">
                <i class="icon">📞</i>
                <a :href="`tel:${event.contact_phone}`">{{ event.contact_phone }}</a>
              </div>
              <div v-if="event.website" class="contact-item">
                <i class="icon">🌐</i>
                <a :href="event.website" target="_blank" rel="noopener">{{ event.website }}</a>
              </div>
              <div v-if="event.organization_address" class="contact-item">
                <i class="icon">📍</i>
                <span>{{ event.organization_address }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Registration Area -->
      <section class="registration-section">
        <div class="registration-card">
          <h3 class="card-title">🎯 Register to Participate</h3>
          
          <!-- Registration available -->
          <div v-if="canRegister" class="registration-available">
            <div class="registration-info">
              <p class="registration-description">
                💝 Join our charity event and bring warmth and hope to those in need!
              </p>
              
              <div class="registration-details">
                <div v-if="event.registration_deadline" class="deadline-info">
                  ⏰ Registration Deadline: {{ formatEventDate(event.registration_deadline) }}
                </div>
                <div v-if="event.max_participants" class="capacity-info">
                  👥 Remaining slots: {{ event.max_participants - event.current_participants }}
                </div>
              </div>
            </div>
            
            <button @click="handleRegistration" class="register-btn" :disabled="registering">
              <span v-if="registering">🔄 Processing...</span>
              <span v-else>
                {{ event.is_free ? '🎁 Free Registration' : `💰 Buy Ticket ${formatAmount(event.ticket_price, event.currency_type)}` }}
              </span>
            </button>
          </div>
          
          <!-- Unavailable Registration State -->
          <div v-else class="registration-unavailable">
            <!-- <div class="unavailable-reason">
              <div v-if="event.status === 'ended'" class="reason-item">
                ⏰ 此活动已经结束
              </div>
              <div v-else-if="event.status === 'suspended'" class="reason-item">
                ⏸️ 此活动已暂停报名
              </div>
              <div v-else-if="isRegistrationClosed" class="reason-item">
                📅 报名时间已截止
              </div>
              <div v-else-if="isFull" class="reason-item">
                👥 报名人数已满
              </div>
              <div v-else class="reason-item">
                ❌ 暂时无法报名
              </div>
            </div> -->

            <!-- Demo: still open registration form (logic toggle only) -->
            <div class="demo-register" style="margin: 1rem 0 2rem;">
              <button @click="handleRegistration" class="register-btn">Registration</button>
            </div>
            
            <div class="alternative-actions">
              <router-link to="/search" class="alt-btn">🔍 Browse Other Events</router-link>
              <router-link to="/" class="alt-btn">🏠 Back</router-link>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 注册模态框 -->
    <div v-if="showRegistrationModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📋 Registration</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <!-- 支付动画覆盖层 -->
          <div v-if="showPaymentAnimation" class="payment-overlay">
            <div class="payment-dialog">
              <div v-if="paymentStatus === 'processing'" class="spinner"></div>
              <div v-if="paymentStatus === 'success'" class="success-check">✔</div>
              <p class="payment-text">
                {{ paymentStatus === 'processing' ? 'Processing payment...' : (paymentStatus === 'success' ? 'Payment successful!' : 'Payment failed') }}
              </p>
            </div>
          </div>

          <div class="form">
            <p class="modal-info" v-if="event && !event.is_free">
              Registration requires {{ formatAmount(event.ticket_price, event.currency_type) }}
            </p>
            <div class="form-row">
              <label>Name</label>
              <input type="text" v-model="donorName" placeholder="Please enter your name" class="input" />
            </div>
            <div class="form-row">
              <label>Payment Method</label>
              <div class="method-toggle">
                <button type="button" class="method-option" :class="{ active: paymentMethod === 'bank' }" @click="paymentMethod = 'bank'">Bank Card</button>
                <button type="button" class="method-option" :class="{ active: paymentMethod === 'alipay' }" @click="paymentMethod = 'alipay'">Alipay</button>
              </div>
              <div class="method-panel">
                <div v-if="paymentMethod === 'bank'" class="method-hint">Pay with bank card (demo only)</div>
                <div v-else class="method-hint">Pay with Alipay (demo only)</div>
              </div>
            </div>
            <p v-if="formError" class="error-tip">{{ formError }}</p>

            <div class="form-actions">
              <button class="modal-btn primary" @click="submitRegistrationForm">Submit</button>
              <button class="modal-btn" @click="closeModal">Cancel</button>
            </div>

            <p v-if="registrationMessage" class="modal-message success">{{ registrationMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  CharityApiService, 
  type CharityEvent,
  formatEventDate, 
  formatAmount, 
  getProgressPercentage,
  getStatusText,
  getStatusClass,
  canRegister as canRegisterEvent,
  handleApiError
} from '@/services/api'

const router = useRouter()
const route = useRoute()

const event = ref<CharityEvent | null>(null)
const loading = ref(false)
const error = ref('')
  const registering = ref(false)
  const showRegistrationModal = ref(false)
  const registrationMessage = ref('')
  const donationAmount = ref<number | string>('')
  const donorName = ref('')
  const paymentMethod = ref<'bank' | 'alipay'>('alipay')
  const formError = ref('')
  const showPaymentAnimation = ref(false)
  const paymentStatus = ref<'processing' | 'success' | 'failed'>('processing')


const progressPercentage = computed(() => {
  if (!event.value) return 0
  const current = Number(event.value.current_amount || 0)
  const target = Number(event.value.target_amount || 0)
  if (!isFinite(current) || current < 0) return 0
  if (!target || target <= 0) {
    return current > 0 ? 100 : 0
  }
  return getProgressPercentage(current, target)
})

const canRegister = computed(() => {
  if (!event.value) return false
  return canRegisterEvent(event.value)
})

const hasContactInfo = computed(() => {
  if (!event.value) return false
  return !!(event.value.contact_email || 
           event.value.contact_phone || 
           event.value.website || 
           event.value.organization_address)
})

const isRegistrationClosed = computed(() => {
  if (!event.value || !event.value.registration_deadline) return false
  return new Date() > new Date(event.value.registration_deadline)
})

const isFull = computed(() => {
  if (!event.value || !event.value.max_participants) return false
  return event.value.current_participants >= event.value.max_participants
})


async function loadEventDetail() {
  const eventId = Number(route.params.id)
  
  if (!eventId || isNaN(eventId)) {
    error.value = 'Invalid event ID'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await CharityApiService.getEventById(eventId)
    
    if (response.code === 200 && response.data) {
      event.value = response.data
    } else {
      throw new Error(response.msg || 'Failed to fetch event details')
    }
  } catch (err) {
    error.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}


async function handleRegistration() {
  if (!event.value) return
  showRegistrationModal.value = true
  registering.value = false
  registrationMessage.value = ''
}

function closeModal() {
  showRegistrationModal.value = false
  registrationMessage.value = ''
  donorName.value = ''
  donationAmount.value = ''
  paymentMethod.value = 'alipay'
  formError.value = ''
}


function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}


function getEventImage(event: CharityEvent): string {
  return event.image_url || `https://picsum.photos/800/400?random=${event.id}`
}


onMounted(() => {
  loadEventDetail()
})

function submitRegistrationForm() {
  formError.value = ''
  if (!donorName.value.trim()) {
    formError.value = 'Please enter your name'
    return
  }
  // Start payment animation
  showPaymentAnimation.value = true
  paymentStatus.value = 'processing'

  // Call backend to register and update DB
  const currentEventId = event.value?.id
  if (!currentEventId) {
    formError.value = 'Event not found'
    showPaymentAnimation.value = false
    return
  }

  CharityApiService.registerForEvent(currentEventId, {
    name: donorName.value,
    method: paymentMethod.value
  })
    .then(() => {
      // Success animation state
      paymentStatus.value = 'success'
      setTimeout(() => {
        showPaymentAnimation.value = false
      }, 1200)

      // Optimistic UI update
      if (event.value) {
        event.value.current_participants = (event.value.current_participants || 0) + 1
        const addAmount = Number(event.value.ticket_price || 0)
        event.value.current_amount = (event.value.current_amount || 0) + addAmount
      }

      registrationMessage.value = `Payment successful (demo): Name ${donorName.value}, Method ${paymentMethod.value === 'bank' ? 'Bank Card' : 'Alipay'}`
    })
    .catch((err) => {
      paymentStatus.value = 'failed'
      formError.value = handleApiError(err)
      setTimeout(() => {
        showPaymentAnimation.value = false
      }, 800)
    })
}
</script>

<style scoped>
.event-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}


.loading {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
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
  padding: 4rem;
  color: #e74c3c;
}

.error h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.retry-btn, .back-btn {
  margin: 0.5rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.retry-btn {
  background: #42b883;
  color: white;
}

.back-btn {
  background: #6c757d;
  color: white;
}


.breadcrumb {
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out;
}

.back-link {
  background: none;
  border: none;
  color: #42b883;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #369870;
  transform: translateX(-5px);
}

.event-content {
  animation: fadeInUp 0.8s ease-out;
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

.event-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.hero-image {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
}

.event-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
  backdrop-filter: blur(10px);
}

.event-category {
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.hero-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-title {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.3;
  font-weight: 700;
}

.event-organization {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meta-item .icon {
  font-size: 1.5rem;
  width: 30px;
  text-align: center;
}

.meta-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.meta-value {
  display: block;
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 600;
}

/* Card common styles */
.fundraising-card,
.description-card,
.organization-card,
.registration-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  animation: slideUp 0.8s ease-out;
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

.card-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* Fundraising progress */
.fundraising-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 15px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.current-amount {
  color: #42b883;
}

.target-amount {
  color: #e74c3c;
}

.percentage {
  color: #f39c12;
}

.progress-container {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #42b883, #369870);
  border-radius: 6px;
  transition: width 0.8s ease;
  animation: progressGrow 1.5s ease-out;
}

@keyframes progressGrow {
  from {
    width: 0;
  }
}

.participants-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #666;
}

.participants-info .icon {
  font-size: 1.2rem;
}

.max-participants {
  color: #999;
  font-size: 0.9rem;
}


.description-content {
  line-height: 1.6;
  color: #555;
}

.full-description,
.description {
  margin: 0;
  font-size: 1rem;
}


.organization-info {
  padding: 0;
}

.org-name {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.org-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.contact-info h5 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #666;
}

.contact-item .icon {
  font-size: 1.2rem;
  width: 20px;
}

.contact-item a {
  color: #42b883;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}


.registration-available {
  text-align: center;
}

.registration-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.registration-details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.deadline-info,
.capacity-info {
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border-radius: 15px;
  font-size: 0.95rem;
  color: #666;
}

.register-btn {
  background: linear-gradient(45deg, #42b883, #369870);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.registration-unavailable {
  text-align: center;
}

.unavailable-reason {
  margin-bottom: 2rem;
}

.reason-item {
  padding: 1rem 2rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 15px;
  color: #856404;
  font-size: 1rem;
}

.alternative-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.alt-btn {
  padding: 0.75rem 2rem;
  background: #6c757d;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.alt-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 2rem;
}

.modal-message {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}
.modal-message.success { color: #42b883; }

.modal-info {
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  padding: 1rem 2rem 2rem;
  text-align: center;
}

.modal-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.modal-btn:hover {
  background: #369870;
}


.form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: flex; flex-direction: column; gap: 0.5rem; }
.input { padding: 0.6rem 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
.method-toggle { display: flex; gap: 0.5rem; }
.method-option { padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer; }
.method-option.active { background: #42b883; color: #fff; border-color: #42b883; }
.method-panel { margin-top: 0.5rem; color: #666; }
.error-tip { color: #e74c3c; }
.form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
.modal-btn.primary { background: #42b883; }


.payment-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  animation: fadeIn 0.2s ease-out;
}
.payment-dialog {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.success-check {
  font-size: 2rem;
  color: #42b883;
  animation: scaleIn 0.25s ease-out;
}
.payment-text { color: #2c3e50; }

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
@keyframes scaleIn { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }


@media (max-width: 768px) {
  .event-hero {
    grid-template-columns: 1fr;
  }
  
  .hero-image {
    height: 250px;
  }
  
  .event-title {
    font-size: 1.8rem;
  }
  
  .fundraising-stats {
    grid-template-columns: 1fr;
  }
  
  .registration-details {
    flex-direction: column;
    gap: 1rem;
  }
  
  .alternative-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
  }
}

.status-upcoming {
  background: #42b883;
}

.status-ongoing {
  background: #f39c12;
}

.status-ended {
  background: #e74c3c;
}

.status-suspended {
  background: #6c757d;
}
</style>