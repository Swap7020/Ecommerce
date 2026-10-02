import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { productService } from '@/services/productService'

const POPULAR = ['Lipstick', 'Foundation', 'Serum', 'Moisturizer', 'Mascara', 'Kajal']

export default function SearchBar({ onClose, autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aura_recent_searches') || '[]') } catch { return [] }
  })
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    const timeout = setTimeout(async () => {
      try {
        const data = await productService.getSearchSuggestions(query)
        setSuggestions(data.suggestions || [])
      } catch {}
    }, 250)
    return () => clearTimeout(timeout)
  }, [query])

  const handleSearch = (q) => {
    const term = q || query
    if (!term.trim()) return
    const updated = [term, ...recent.filter(r => r !== term)].slice(0, 5)
    setRecent(updated)
    localStorage.setItem('aura_recent_searches', JSON.stringify(updated))
    navigate(`/shop?search=${encodeURIComponent(term)}`)
    onClose?.()
  }

  return (
    <div className="bg-white rounded-2xl shadow-medium p-4">
      <div className="flex items-center gap-3 border-b border-nude-100 pb-4">
        <Search size={20} className="text-nude shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search for products, brands..."
          className="flex-1 text-sm outline-none placeholder-charcoal-300 bg-transparent"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-charcoal-300 hover:text-charcoal">
            <X size={16} />
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="btn-ghost px-3 py-1.5 text-xs">
            Cancel
          </button>
        )}
      </div>

      <div className="pt-3">
        {suggestions.length > 0 ? (
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => handleSearch(s.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-ivory text-left transition-colors"
                >
                  <Search size={14} className="text-charcoal-300 shrink-0" />
                  <span>{s.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-5">
            {recent.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest px-3 mb-2">
                  Recent Searches
                </p>
                <div className="flex flex-wrap gap-2 px-3">
                  {recent.map(r => (
                    <button
                      key={r}
                      onClick={() => handleSearch(r)}
                      className="flex items-center gap-1.5 text-xs bg-ivory px-3 py-1.5 rounded-full hover:bg-nude-100 transition-colors"
                    >
                      <Clock size={12} className="text-charcoal-300" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest px-3 mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 px-3">
                {POPULAR.map(p => (
                  <button
                    key={p}
                    onClick={() => handleSearch(p)}
                    className="flex items-center gap-1.5 text-xs bg-nude-100/60 text-nude-700 px-3 py-1.5 rounded-full hover:bg-nude hover:text-white transition-colors"
                  >
                    <TrendingUp size={12} />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
