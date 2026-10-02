import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import BackToTop from '@/components/common/BackToTop'

export default function MainLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  const isCheckout = pathname.startsWith('/checkout')

  return (
    <div className="flex flex-col min-h-screen">
      {!isCheckout && <AnnouncementBar />}
      <Navbar minimal={isCheckout} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isCheckout && <Footer />}
      <BackToTop />
    </div>
  )
}
