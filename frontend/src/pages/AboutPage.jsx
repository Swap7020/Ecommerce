import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Heart, Star, Users } from 'lucide-react'

const VALUES = [
  { icon: Leaf, title: 'Clean Beauty', desc: 'We believe in formulas that are kind to your skin and the environment. All our products are dermatologist tested.' },
  { icon: Heart, title: 'Made with Care', desc: 'Every AURA product is crafted with meticulous attention to quality, texture, and performance.' },
  { icon: Star, title: 'Premium Quality', desc: 'We source the finest ingredients from around the world to deliver a truly premium beauty experience.' },
  { icon: Users, title: 'For Everyone', desc: 'AURA is designed to celebrate diverse skin tones, types, and beauty routines across India.' },
]

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ivory-200 to-champagne/40 py-20">
        <div className="container-aura text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-3">Our Story</p>
          <h1 className="font-display text-5xl text-charcoal mb-5">Beauty Made for the Real You.</h1>
          <p className="text-charcoal-400 leading-relaxed">
            AURA was born from a simple belief: every person deserves to access premium, authentic beauty products 
            that actually work. We're an India-first cosmetics brand committed to quality, honesty, and confidence.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container-aura">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-charcoal">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-nude-100 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-nude" />
                </div>
                <h3 className="font-medium text-charcoal mb-2">{title}</h3>
                <p className="text-sm text-charcoal-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-charcoal">
        <div className="container-aura text-center">
          <h2 className="font-display text-4xl text-white mb-4">Start Your AURA Journey</h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Discover our full range of premium beauty products crafted for the modern Indian woman.
          </p>
          <Link to="/shop" className="btn-primary bg-nude hover:bg-nude-700 px-10 py-4 inline-flex">
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
