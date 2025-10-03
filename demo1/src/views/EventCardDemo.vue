﻿<template>
  <div class="event-card-demo">
    <!-- Page Header -->
    <div class="demo-header">
      <h1>Event Card Showcase</h1>
      <p class="demo-description">
        Showcase of event card component based on backend API data
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading event data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h2>😞 Load Failed</h2>
      <p>{{ error }}</p>
      <button @click="loadEvents" class="retry-btn">Reload</button>
    </div>

    <!-- Event Cards Grid -->
    <div v-else class="cards-grid">
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event-data="event"
        :clickable="true"
        :show-actions="true"
        @click="handleCardClick"
        @view-detail="handleViewDetail"
        @participate="handleParticipate"
        class="card-item"
      />
      
      <!-- Empty State -->
      <div v-if="events.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No event data</h3>
        <p>No events to display currently. Please try again later.</p>
        <button @click="loadEvents" class="reload-btn">Refresh Data</button>
      </div>
    </div>

    <!-- Action Feedback Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
          <div class="event-info" v-if="selectedEvent">
            <p><strong>Event Title:</strong> {{ selectedEvent.title }}</p>
            <p><strong>Event ID:</strong> {{ selectedEvent.id }}</p>
            <p><strong>Detail ID:</strong> {{ selectedEvent.article_detail_id }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="modal-btn">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EventCard from '@/components/EventCard.vue'

// Define backend response interface
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

// Reactive state
const events = ref<EventData[]>([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const selectedEvent = ref<EventData | null>(null)

// Mock API data (based on provided response format)


// Load event data
async function loadEvents() {
  loading.value = true
  error.value = ''
  
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Replace with real API call if needed
    // const response = await fetch('/api/activity/getActivity')
    // const data = await response.json()
    
    const data = mockApiResponse
    
    if (data.code === 200 && data.data) {
      events.value = data.data
    } else {
      throw new Error(data.msg || 'Failed to fetch events')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Network request failed'
  } finally {
    loading.value = false
  }
}

// Handle card click
function handleCardClick(eventData: EventData) {
  selectedEvent.value = eventData
  modalTitle.value = 'Card Click'
  modalMessage.value = `You clicked the event card: ${eventData.title}`
  showModal.value = true
}

// Handle view detail
function handleViewDetail(eventData: EventData) {
  selectedEvent.value = eventData
  modalTitle.value = 'View Details'
  modalMessage.value = `Navigating to the event details page...`
  showModal.value = true
  
  // Add routing navigation logic here if needed
  console.log('Navigate to detail page:', eventData.article_detail_id)
}

// Handle participation
function handleParticipate(eventData: EventData) {
  selectedEvent.value = eventData
  modalTitle.value = 'Participate'
  modalMessage.value = `You chose to participate in: ${eventData.title}`
  showModal.value = true
}

// Close modal
function closeModal() {
  showModal.value = false
  modalTitle.value = ''
  modalMessage.value = ''
  selectedEvent.value = null
}

// Load data on mount
onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.event-card-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Page header */
.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 700;
}

.demo-description {
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Loading state */
.loading-container {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-container {
  text-align: center;
  padding: 4rem;
  color: #ef4444;
}

.error-container h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.retry-btn, .reload-btn {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.retry-btn:hover, .reload-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Card grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.card-item {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty state */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

/* Modal */
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
  border-radius: 16px;
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
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.modal-body {
  padding: 2rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #374151;
  line-height: 1.6;
}

.event-info {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.event-info p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem 2rem 2rem;
  text-align: right;
}

.modal-btn {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.modal-btn:hover {
  background: #2563eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .event-card-demo {
    padding: 1rem 0.5rem;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>