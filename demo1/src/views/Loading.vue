<template>
  <div class="loading-container">
    <div class="loading-content">
      <!-- Main title - explosion and reassembly effect -->
      <h1 class="loading-title explosion-text">Charitable Activities</h1>
      
      <!-- Subtitle - neon effect -->
      <p class="loading-subtitle neon-text">Making a Difference Together</p>
      
      <!-- Dynamic text - character rain effect -->
      <div class="loading-message rain-text">Spreading Kindness Worldwide</div>
      
      <!-- Typewriter text -->
      <div class="typewriter-container">
        <div class="typewriter-text-loading"></div>
      </div>
      
      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-text">Loading... <span class="progress-number">0%</span></div>
      </div>
      
      <!-- Decorative animation elements -->
      <div class="floating-hearts">
        <div class="heart">💝</div>
        <div class="heart">🌟</div>
        <div class="heart">💖</div>
        <div class="heart">✨</div>
        <div class="heart">🎯</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGSAPAnimations } from '@/composables/useGSAPAnimations'
import { useRouter } from 'vue-router'

const router = useRouter()

const {
  createAdvancedTextAnimations,
  cleanup
} = useGSAPAnimations()

onMounted(() => {
  const advancedAnimations = createAdvancedTextAnimations()
  
  // Delay triggering various animation effects
  setTimeout(() => {
    advancedAnimations.createTextExplosion('.explosion-text')
  }, 500)
  
  setTimeout(() => {
    advancedAnimations.createNeonEffect('.neon-text')
  }, 1500)
  
  setTimeout(() => {
    advancedAnimations.createCharacterRain('.rain-text')
  }, 2500)
  
  // Typewriter effect
  setTimeout(() => {
    advancedAnimations.createAdvancedTypewriter('.typewriter-text-loading', [
      'Welcome to our platform...',
      'Connecting hearts worldwide...',
      'Building a better tomorrow...',
      'Ready to make a difference!'
    ], {
      speed: 0.08,
      deleteSpeed: 0.03,
      pauseTime: 1.5,
      loop: false
    })
  }, 3500)
  
  // Progress bar animation
  const progressFill = document.querySelector('.progress-fill') as HTMLElement
  const progressNumber = document.querySelector('.progress-number') as HTMLElement
  
  if (progressFill && progressNumber) {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        // Navigate to home after completion
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
      
      progressFill.style.width = `${progress}%`
      progressNumber.textContent = `${Math.floor(progress)}%`
    }, 200)
  }
  
  // Floating heart animations
  const hearts = document.querySelectorAll('.heart')
  hearts.forEach((heart, index) => {
    gsap.to(heart, {
      y: -20,
      duration: 2 + index * 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.5
    })
    
    gsap.to(heart, {
      rotation: 360,
      duration: 4 + index * 0.5,
      repeat: -1,
      ease: "none"
    })
  })
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.loading-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.loading-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>');
  animation: grain 20s linear infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  20% { transform: translate(-15%, 5%); }
  30% { transform: translate(7%, -25%); }
  40% { transform: translate(-5%, 25%); }
  50% { transform: translate(-15%, 10%); }
  60% { transform: translate(15%, 0%); }
  70% { transform: translate(0%, 15%); }
  80% { transform: translate(3%, -10%); }
  90% { transform: translate(-10%, 5%); }
}

.loading-content {
  text-align: center;
  z-index: 2;
  position: relative;
  max-width: 600px;
  padding: 2rem;
}

.loading-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  perspective: 1000px;
}

.loading-subtitle {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.loading-message {
  font-size: 1.4rem;
  margin-bottom: 3rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.typewriter-container {
  min-height: 60px;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typewriter-text-loading {
  font-size: 1.2rem;
  color: #4ecdc4;
  font-weight: 500;
  min-height: 1.5em;
}

.progress-container {
  margin-bottom: 3rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #44a08d);
  border-radius: 4px;
  width: 0%;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

.progress-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
}

.progress-number {
  color: #4ecdc4;
  font-weight: bold;
}

.floating-hearts {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.heart {
  position: absolute;
  font-size: 2rem;
  opacity: 0.7;
}

.heart:nth-child(1) { top: 20%; left: 10%; }
.heart:nth-child(2) { top: 30%; right: 15%; }
.heart:nth-child(3) { bottom: 30%; left: 20%; }
.heart:nth-child(4) { bottom: 20%; right: 10%; }
.heart:nth-child(5) { top: 50%; left: 50%; transform: translate(-50%, -50%); }


.explosion-text .explode-char,
.rain-text .rain-char {
  display: inline-block;
  transform-style: preserve-3d;
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


@media (max-width: 768px) {
  .loading-title {
    font-size: 2.5rem;
  }
  
  .loading-subtitle {
    font-size: 1.4rem;
  }
  
  .loading-message {
    font-size: 1.1rem;
  }
  
  .loading-content {
    padding: 1rem;
  }
}
</style>