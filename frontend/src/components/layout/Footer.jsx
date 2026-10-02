import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import NewsletterForm from '@/components/common/NewsletterForm'

const LINKS = {
  Company: [
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/careers', label: 'Careers' },
  ],
  'Customer Support': [
    { to: '/help', label: 'Help Center' },
    { to: '/shipping', label: 'Shipping Info' },
    { to: '/returns', label: 'Returns & Exchanges' },
    { to: '/faq', label: 'FAQs' },
  ],
  Legal: [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms & Conditions' },
    { to: '/refund-policy', label: 'Refund Policy' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-aura py-16">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-xs tracking-[0.3em] text-nude uppercase mb-3">Stay Connected</p>
            <h3 className="font-display text-3xl md:text-4xl mb-3">Stay in Your AURA.</h3>
            <p className="text-white/60 text-sm mb-8">
              Get beauty tips, new arrivals and exclusive offers directly in your inbox.
            </p>
            <NewsletterForm dark />
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-aura py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-3xl font-semibold tracking-[0.2em] text-white">
              AURA
            </Link>
            <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-xs">
              Premium beauty essentials designed to help you look good, feel confident, and express your individuality.
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-nude hover:border-nude transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            {/* Contact */}
            <div className="mt-6 space-y-2">
              <a href="mailto:hello@auracosmetics.in" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
                <Mail size={14} /> hello@auracosmetics.in
              </a>
              <a href="tel:+918000000000" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
                <Phone size={14} /> +91 80000 00000
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-5">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-aura py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} AURA Cosmetics. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Secure payments via</span>
            <span className="font-medium text-white/60">Razorpay</span>
            <span>·</span>
            <span className="font-medium text-white/60">Stripe</span>
            <span>·</span>
            <span className="font-medium text-white/60">UPI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
