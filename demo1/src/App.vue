<script setup lang="ts">
// Main component - Charity Platform
import { ref, onMounted, onUnmounted } from 'vue'

const showRegisterModal = ref(false)
const onRegisterClick = () => {
  showRegisterModal.value = true
}
const closeModal = () => {
  showRegisterModal.value = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
<!-- Top section -->
<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">💝 Charity Platform</h1>
          <p class="app-subtitle">Connecting kindness, spreading hope</p>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-link">
            <i class="icon">🏠</i>
            <span>Home</span>
          </router-link>
          <router-link to="/search" class="nav-link">
            <i class="icon">🔍</i>
            <span>Search Events</span>
          </router-link>
          <button type="button" class="nav-link" @click="onRegisterClick">
            <i class="icon">📝</i>
            <span>register</span>
          </button>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <router-view></router-view>
    </main>
    <!-- Register modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="registerTitle">
        <div class="modal-header">
          <h2 id="registerTitle">Register</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close">✖</button>
        </div>
        <div class="modal-body">
          <p>This feature is currently under construction</p>
        </div>
        <div class="modal-actions">
          <button class="primary" @click="closeModal">OK</button>
        </div>
      </div>
    </div>
    <!-- Footer -->
    <footer class="app-footer">
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #ffffff);
  min-height: 100vh;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header styles */
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.8s ease-out;
  position: sticky;
  top: 0;
  z-index: 1000;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  text-align: left;
}

.app-title {
  font-size: 2rem;
  color:write;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  letter-spacing: 1px;
  margin-bottom: 0.25rem;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  color: #495057;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-weight: 500;
}

.nav-link .icon {
  font-size: 1.1rem;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #42b883, #369870);
  transition: left 0.3s ease;
  z-index: -1;
}

.nav-link:hover::before,
.nav-link.router-link-active::before {
  left: 0;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* Main content area */
.main-content {
  background: white;
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Footer styles */
.app-footer {
  background: rgba(44, 62, 80, 0.95);
  color: white;
  padding: 2rem 0 1rem;
  margin-top: auto;
}

/* Modal dialog */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}
.modal-content {
  width: min(520px, 92vw);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.2);
  overflow: hidden;
  transform: translateY(0);
  animation: scaleIn 0.2s ease-out;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
}
.modal-header h2 { font-size: 1.1rem; }
.close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
.modal-body { padding: 1rem 1.25rem; color: #333; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem 1.25rem;
}
.modal-actions .primary {
  background: #42b883;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { transform: scale(0.96); }
  to { transform: scale(1); }
}


/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-link {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .app-title {
    font-size: 1.6rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  
}

@media (max-width: 480px) {
  .header-content {
    padding: 1rem;
  }
  
  .app-title {
    font-size: 1.4rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
