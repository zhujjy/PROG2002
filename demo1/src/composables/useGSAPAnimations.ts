import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGSAPAnimations() {
  const isAnimationReady = ref(false)

 
  const initAnimations = () => {
   
    gsap.set('.animate-fade-up', { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    })
    
    gsap.set('.animate-fade-left', { 
      opacity: 0, 
      x: -50 
    })
    
    gsap.set('.animate-fade-right', { 
      opacity: 0, 
      x: 50 
    })
    
    gsap.set('.animate-scale', { 
      opacity: 0, 
      scale: 0.8 
    })

    isAnimationReady.value = true
  }

 
  const animateHero = () => {
    const tl = gsap.timeline()
    
   
    gsap.set('.shape', { 
      opacity: 0, 
      scale: 0,
      rotation: 0
    })
    
    tl.to('.shape', {
      opacity: 0.1,
      scale: 1,
      rotation: 360,
      duration: 2,
      stagger: 0.2,
      ease: 'power2.out'
    })
    .from('.hero-title', {
      duration: 1.2,
      y: 100,
      opacity: 0,
      ease: 'power3.out'
    }, '-=1.5')
    .from('.hero-subtitle', {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: 'power2.out'
    }, '-=0.8')
    .from('.stat-item', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    }, '-=0.5')

   
    gsap.to('.shape-1', {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'none'
    })
    
    gsap.to('.shape-2', {
      rotation: -360,
      duration: 25,
      repeat: -1,
      ease: 'none'
    })
    
    gsap.to('.shape-3', {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    })
    
    gsap.to('.shape-4', {
      x: 30,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    })
    
    gsap.to('.shape-5', {
      scale: 1.2,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    })

    return tl
  }

 
  const createScrollAnimations = () => {
   
    gsap.utils.toArray('.animate-fade-up').forEach((element: any) => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse'
        }
      })
    })

   
    gsap.utils.toArray('.animate-fade-left').forEach((element: any) => {
      gsap.to(element, {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })
    })

   
    gsap.utils.toArray('.animate-fade-right').forEach((element: any) => {
      gsap.to(element, {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })
    })

   
    gsap.utils.toArray('.animate-scale').forEach((element: any) => {
      gsap.to(element, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })
    })
  }

 
  const animateNumbers = (selector: string, endValue: number, duration: number = 2) => {
    const element = document.querySelector(selector)
    if (!element) return

    gsap.to({ value: 0 }, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: function() {
        const currentValue = Math.round(this.targets()[0].value)
        element.textContent = currentValue.toLocaleString()
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        once: true
      }
    })
  }

 
  const typewriterEffect = (selector: string, text: string, speed: number = 0.05) => {
    const element = document.querySelector(selector)
    if (!element) return

    element.textContent = ''
    
    gsap.to({ progress: 0 }, {
      progress: text.length,
      duration: text.length * speed,
      ease: 'none',
      onUpdate: function() {
        const progress = Math.floor(this.targets()[0].progress)
        element.textContent = text.substring(0, progress)
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        once: true
      }
    })
  }

 
  const splitTextAnimation = (selector: string) => {
    const elements = gsap.utils.toArray(selector)
    
    elements.forEach((element: any) => {
      const text = element.textContent
      const chars = text.split('')
      
      element.innerHTML = chars.map(char => 
        char === ' ' ? '<span>&nbsp;</span>' : `<span>${char}</span>`
      ).join('')
      
      const spans = element.querySelectorAll('span')
      
      gsap.set(spans, { opacity: 0, y: 50 })
      
      gsap.to(spans, {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: 0.02,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          once: true
        }
      })
    })
  }

 
  const fadeInWords = (selector: string) => {
    const elements = gsap.utils.toArray(selector)
    
    elements.forEach((element: any) => {
      const text = element.textContent
      const words = text.split(' ')
      
      element.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ')
      
      const wordSpans = element.querySelectorAll('.word')
      
      gsap.set(wordSpans, { opacity: 0, y: 20 })
      
      gsap.to(wordSpans, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          once: true
        }
      })
    })
  }

 
  const addHoverAnimations = () => {
   
    gsap.utils.toArray('.event-card, .stat-card, .achievement-card').forEach((card: any) => {
      const tl = gsap.timeline({ paused: true })
      
      tl.to(card, {
        y: -10,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: 'power2.out'
      })

      card.addEventListener('mouseenter', () => tl.play())
      card.addEventListener('mouseleave', () => tl.reverse())
    })

   
    gsap.utils.toArray('.nav-link, .retry-btn').forEach((button: any) => {
      const tl = gsap.timeline({ paused: true })
      
      tl.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      })

      button.addEventListener('mouseenter', () => tl.play())
      button.addEventListener('mouseleave', () => tl.reverse())
    })
  }

 
  const createAdvancedScrollEffects = () => {
   
    gsap.registerPlugin(ScrollTrigger)
    
   
    ScrollTrigger.create({
      trigger: '.hero-section',
      start: 'top top',
      end: '+=300',
      pin: true,
      pinSpacing: false,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        gsap.to('.floating-shapes .shape', {
          y: progress * 50,
          rotation: progress * 180,
          scale: 1 + progress * 0.2,
          duration: 0.3,
          stagger: 0.1
        })
      }
    })

   
    ScrollTrigger.create({
      trigger: '.featured-org-container',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
      animation: gsap.timeline()
        .to('.org-logo-container', {
          scale: 1.1,
          rotation: 5,
          duration: 1
        })
        .to('.stat-card', {
          y: -20,
          stagger: 0.1,
          duration: 0.8
        }, '-=0.5')
    })

   
    ScrollTrigger.batch('.event-card', {
      onEnter: (elements) => {
        gsap.from(elements, {
          y: 100,
          opacity: 0,
          scale: 0.8,
          rotation: 10,
          duration: 1,
          stagger: 0.15,
          ease: 'back.out(1.7)'
        })
      },
      onLeave: (elements) => {
        gsap.to(elements, {
          y: -50,
          opacity: 0.3,
          duration: 0.5,
          stagger: 0.1
        })
      },
      onEnterBack: (elements) => {
        gsap.to(elements, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1
        })
      }
    })

   
    ScrollTrigger.create({
      trigger: '.hero-stats',
      start: 'top 70%',
      onEnter: () => {
        const elements = gsap.utils.toArray<HTMLElement>('.stat-number')
        elements.forEach((el) => {
          const finalValue = (el.getAttribute('data-final') || el.textContent || '').trim()
         
          const numericMatch = /^[\d,\.\s]+$/.test(finalValue)
          if (numericMatch) {
            const targetValue = Number(finalValue.replace(/[,\s]/g, ''))
            gsap.to({ value: 0 }, {
              value: targetValue,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function() {
                const current = Math.round((this as any).targets()[0].value)
                el.textContent = current.toLocaleString()
              },
              stagger: 0.2
            })
          } else {
           
            el.textContent = finalValue
          }
        })
      }
    })
  }

 
  const createDynamicTextAnimation = (selector: string, words: string[]) => {
    const element = document.querySelector(selector)
    if (!element) return

    let currentIndex = 0
    const originalText = element.textContent || ''
    
   
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })
    
    words.forEach((word, index) => {
      tl.to(element, {
        duration: 0.5,
        ease: 'power2.inOut',
        onStart: () => {
         
          const chars = word.split('')
          let currentText = originalText
          
          chars.forEach((char, charIndex) => {
            gsap.delayedCall(charIndex * 0.05, () => {
              const textArray = currentText.split('')
              if (textArray[charIndex]) {
                textArray[charIndex] = char
                currentText = textArray.join('')
                element.textContent = currentText
              }
            })
          })
        }
      })
      .to(element, {
        duration: 0.3,
        scale: 1.05,
        color: '#00ff88',
        textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
        ease: 'back.out(1.7)'
      }, '-=0.2')
      .to(element, {
        duration: 0.3,
        scale: 1,
        color: '#ffffff',
        textShadow: '0 0 0px rgba(0, 255, 136, 0)',
        ease: 'power2.out'
      }, '+=1.5')
    })
    
    return tl
  }

 
  const createTextMorphAnimation = (selector: string) => {
    const element = document.querySelector(selector)
    if (!element) return

    const text = element.textContent || ''
    const chars = text.split('')
    
   
    element.innerHTML = ''
    chars.forEach((char, index) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      span.classList.add(`char-${index}`)
      element.appendChild(span)
    })

   
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 })
    
    tl.from(`.char-${chars.length - 1}, .char-${chars.length - 2}, .char-${chars.length - 3}`, {
      duration: 0.8,
      y: -50,
      opacity: 0,
      rotation: 180,
      scale: 0,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    })
    .to(element.querySelectorAll('span'), {
      duration: 1.5,
      color: (index) => {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
        return colors[index % colors.length]
      },
      textShadow: '0 0 10px currentColor',
      stagger: 0.1,
      ease: 'power2.inOut'
    }, '-=0.5')
    .to(element.querySelectorAll('span'), {
      duration: 1,
      color: '#ffffff',
      textShadow: '0 0 0px currentColor',
      stagger: 0.05,
      ease: 'power2.out'
    }, '+=1')

    return tl
  }

 
  const enhancedTypewriterEffect = (selector: string, text: string, options = {}) => {
    const element = document.querySelector(selector)
    if (!element) return

    const defaultOptions = {
      speed: 0.05,
      cursor: true,
      cursorChar: '|',
      onComplete: null,
      ...options
    }

    element.textContent = ''
    
   
    if (defaultOptions.cursor) {
      const cursor = document.createElement('span')
      cursor.textContent = defaultOptions.cursorChar
      cursor.style.animation = 'blink 1s infinite'
      cursor.classList.add('typewriter-cursor')
      element.appendChild(cursor)
    }

    const tl = gsap.timeline()
    const chars = text.split('')
    
    chars.forEach((char, index) => {
      tl.call(() => {
       
        const charSpan = document.createElement('span')
        charSpan.textContent = char
        charSpan.style.display = 'inline-block'
        
        if (defaultOptions.cursor) {
          element.insertBefore(charSpan, element.lastChild)
        } else {
          element.appendChild(charSpan)
        }
        
       
        gsap.from(charSpan, {
          duration: 0.1,
          scale: 0,
          opacity: 0,
          ease: 'back.out(2)'
        })
      }, [], index * defaultOptions.speed)
    })

    if (defaultOptions.onComplete) {
      tl.call(defaultOptions.onComplete)
    }

    return tl
  }

 
  const enhanceHeroTextAnimations = () => {
   
    const heroTitle = document.querySelector('.hero-title')
    if (heroTitle) {
      const text = heroTitle.textContent || ''
      heroTitle.innerHTML = text.split('').map(char => 
        char === ' ' ? ' ' : `<span class="char">${char}</span>`
      ).join('')
      
      gsap.fromTo('.hero-title .char', {
        y: 100,
        opacity: 0,
        rotationX: -90,
        transformOrigin: '50% 50% -50px'
      }, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.7)',
        delay: 0.5
      })
    }
    
   
    const heroSubtitle = document.querySelector('.hero-subtitle')
    if (heroSubtitle) {
      const text = heroSubtitle.textContent || ''
      heroSubtitle.innerHTML = text.split('').map(char => 
        char === ' ' ? ' ' : `<span class="char">${char}</span>`
      ).join('')
      
      gsap.fromTo('.hero-subtitle .char', {
        y: 50,
        opacity: 0,
        scale: 0.5
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.03,
        ease: 'elastic.out(1, 0.3)',
        delay: 1.2
      })
      
     
      gsap.to('.hero-subtitle .char', {
        y: -10,
        duration: 1.5,
        stagger: 0.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2
      })
    }
  }

 
  const createAdvancedTextAnimations = () => {
   
    const createCharacterRain = (selector: string) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        const text = element.textContent || ''
        element.innerHTML = text.split('').map(char => 
          char === ' ' ? ' ' : `<span class="rain-char">${char}</span>`
        ).join('')
        
        const chars = element.querySelectorAll('.rain-char')
        
       
        gsap.set(chars, {
          display: 'inline-block',
          opacity: 1,
          visibility: 'visible'
        })
        
        gsap.fromTo(chars, {
          y: -100,
          opacity: 0,
          rotationX: -90,
          scale: 0.5
        }, {
          y: 0,
          opacity: 1,
          rotationX: 0,
          scale: 1,
          duration: 1.2,
          stagger: {
            amount: 2,
            from: "random"
          },
          ease: "bounce.out"
        })
      })
    }
    
   
    const createTextExplosion = (selector: string) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        const text = element.textContent || ''
        element.innerHTML = text.split('').map(char => 
          char === ' ' ? ' ' : `<span class="explode-char">${char}</span>`
        ).join('')
        
        const chars = element.querySelectorAll('.explode-char')
        
       
        gsap.set(chars, {
          display: 'inline-block',
          opacity: 1,
          visibility: 'visible',
          zIndex: 'inherit'
        })
        
       
        gsap.set(chars, {
          x: () => gsap.utils.random(-200, 200),
          y: () => gsap.utils.random(-200, 200),
          rotation: () => gsap.utils.random(-360, 360),
          scale: 0,
          opacity: 0
        })
        
       
        gsap.to(chars, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 1.5,
          stagger: 0.05,
          ease: "back.out(1.7)",
          delay: 0.5,
          onComplete: () => {
           
            gsap.set(chars, { opacity: 1, visibility: 'visible' })
          }
        })
      })
    }
    
   
    const createNeonEffect = (selector: string) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
       
        gsap.set(element, {
          opacity: 1,
          visibility: 'visible'
        })
        
       
        gsap.set(element, {
          textShadow: "0 0 5px #ff6b6b, 0 0 10px #ff6b6b, 0 0 15px #ff6b6b, 0 0 20px #ff6b6b",
          color: "#ffffff"
        })
        
       
        gsap.to(element, {
          textShadow: "0 0 10px #4ecdc4, 0 0 20px #4ecdc4, 0 0 30px #4ecdc4, 0 0 40px #4ecdc4",
          color: "#4ecdc4",
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        })
      })
    }
    
   
    const createAdvancedTypewriter = (selector: string, texts: string[], options = {}) => {
      const defaultOptions = {
        speed: 0.1,
        deleteSpeed: 0.05,
        pauseTime: 2,
        cursor: true,
        cursorChar: '|',
        loop: true,
        ...options
      }
      
      const element = document.querySelector(selector) as HTMLElement
      if (!element) return
      
      let currentIndex = 0
      const tl = gsap.timeline({ repeat: defaultOptions.loop ? -1 : 0 })
      
     
      if (defaultOptions.cursor) {
        const cursor = document.createElement('span')
        cursor.textContent = defaultOptions.cursorChar
        cursor.className = 'typewriter-cursor'
        element.appendChild(cursor)
        
       
        gsap.to(cursor, {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        })
      }
      
      texts.forEach((text, index) => {
       
        tl.call(() => {
          element.textContent = ''
          if (defaultOptions.cursor) {
            const cursor = document.createElement('span')
            cursor.textContent = defaultOptions.cursorChar
            cursor.className = 'typewriter-cursor'
            element.appendChild(cursor)
          }
        })
        
        text.split('').forEach((char, charIndex) => {
          tl.call(() => {
            const charSpan = document.createElement('span')
            charSpan.textContent = char
            charSpan.style.display = 'inline-block'
            
            if (defaultOptions.cursor) {
              element.insertBefore(charSpan, element.lastChild)
            } else {
              element.appendChild(charSpan)
            }
            
           
            gsap.from(charSpan, {
              scale: 0,
              opacity: 0,
              y: -20,
              duration: 0.2,
              ease: "back.out(2)"
            })
          }, [], charIndex * defaultOptions.speed)
        })
        
       
        tl.to({}, { duration: defaultOptions.pauseTime })
        
       
        if (index < texts.length - 1 || defaultOptions.loop) {
          for (let i = text.length - 1; i >= 0; i--) {
            tl.call(() => {
              const chars = element.querySelectorAll('span:not(.typewriter-cursor)')
              if (chars.length > 0) {
                const lastChar = chars[chars.length - 1]
                gsap.to(lastChar, {
                  scale: 0,
                  opacity: 0,
                  duration: 0.1,
                  onComplete: () => lastChar.remove()
                })
              }
            }, [], i * defaultOptions.deleteSpeed)
          }
        }
      })
      
      return tl
    }
    
    return {
      createCharacterRain,
      createTextExplosion,
      createNeonEffect,
      createAdvancedTypewriter
    }
  }
  const cleanup = () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }

  return {
    isAnimationReady,
    initAnimations,
    animateHero,
    createScrollAnimations,
    animateNumbers,
    typewriterEffect,
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
  }
}
