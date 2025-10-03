import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Search from '@/views/Search.vue'
import EventDetail from '@/views/EventDetail.vue'
import EventCardDemo from '@/views/EventCardDemo.vue'
import Loading from '@/views/Loading.vue'

const routes = [
  {
    path: '/loading',
    name: 'Loading',
    component: Loading,
    meta: { title: 'Loading - Charity Platform' }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Home - Charity Platform' }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { title: 'Search Events - Charity Platform' }
  },
  {
    path: '/event/:id',
    name: 'EventDetail',
    component: EventDetail,
    meta: { title: 'Event Details - Charity Platform' },
    props: true
  },
  {
    path: '/demo',
    name: 'EventCardDemo',
    component: EventCardDemo,
    meta: { title: 'Event Card Demo - Charity Platform' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Route guard - update page title
router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
})

export default router