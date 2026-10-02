import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, LayoutGrid, List, Search } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import ProductCard from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import Breadcrumb from '@/components/common/Breadcrumb'
import { formatPrice } from '@/utils/formatters'
import clsx from 'clsx'

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: '-rating', label: 'Top Rated' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-discount_percent', label: 'Biggest Discount' },
  { value: '-review_count', label: 'Most Reviewed' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const getParams = useCallback(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_rating: searchParams.get('min_rating') || '',
    in_stock: searchParams.get('in_stock') || '',
    is_new_arrival: searchParams.get('is_new_arrival') || '',
    is_best_seller: searchParams.get('is_best_seller') || '',
    ordering: searchParams.get('ordering') || '-created_at',
    page,
  }), [searchParams, page])

  useEffect(() => {
    categoryService.getCategories().then(data => setCategories(data.results || data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = getParams()
    const clean = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== '' && v !== null))
    productService.getProducts(clean)
      .then(data => {
        setProducts(data.results || [])
        setPagination({ count: data.count, next: data.next, previous: data.previous })
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [getParams])

  const updateFilter = (key, value) => {
    setPage(1)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      return next
    })
  }

  const clearAllFilters = () => {
    setPage(1)
    setSearchParams({ ordering: '-created_at' })
  }

  const hasActiveFilters = ['search', 'category', 'brand', 'min_price', 'max_price', 'min_rating', 'in_stock', 'is_new_arrival', 'is_best_seller']
    .some(k => searchParams.get(k))

  const totalPages = Math.ceil(pagination.count / 20)

  const title = searchParams.get('search')
    ? `Search: "${searchParams.get('search')}"`
    : searchParams.get('category')
    ? categories.find(c => c.slug === searchParams.get('category'))?.name || 'Products'
    : searchParams.get('is_best_seller') ? 'Best Sellers'
    : searchParams.get('is_new_arrival') ? 'New Arrivals'
    : 'All Products'

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Page header */}
      <div className="bg-white border-b border-nude-100">
        <div className="container-aura py-6">
          <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: title }]} />
          <div className="flex items-end justify-between mt-3">
            <div>
              <h1 className="font-display text-3xl text-charcoal">{title}</h1>
              {!loading && (
                <p className="text-sm text-charcoal-400 mt-1">{pagination.count} products found</p>
              )}
            </div>
            {/* Desktop sort */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs text-charcoal-400">Sort by:</span>
              <select
                value={searchParams.get('ordering') || '-created_at'}
                onChange={e => updateFilter('ordering', e.target.value)}
                className="text-sm border border-nude-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-nude"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container-aura py-6">
        {/* Mobile filter/sort bar */}
        <div className="flex gap-3 mb-5 md:hidden">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-nude-200 rounded-xl py-3 text-sm font-medium"
          >
            <SlidersHorizontal size={16} /> Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-nude rounded-full" />}
          </button>
          <select
            value={searchParams.get('ordering') || '-created_at'}
            onChange={e => updateFilter('ordering', e.target.value)}
            className="flex-1 text-sm border border-nude-200 rounded-xl px-3 py-3 bg-white outline-none"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters — desktop */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-soft sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-medium text-sm text-charcoal">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-xs text-nude hover:text-nude-700">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel
                categories={categories}
                searchParams={searchParams}
                onUpdate={updateFilter}
              />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {Array.from(searchParams.entries())
                  .filter(([k]) => k !== 'ordering' && k !== 'page')
                  .map(([k, v]) => (
                    <span key={k} className="inline-flex items-center gap-1.5 bg-nude-100 text-nude-700 text-xs px-3 py-1.5 rounded-full">
                      {k === 'search' ? `"${v}"` : v}
                      <button onClick={() => updateFilter(k, '')} className="hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))
                }
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search size={40} className="text-nude-200 mb-4" />
                <h3 className="font-serif text-xl text-charcoal mb-2">No products found</h3>
                <p className="text-sm text-charcoal-400 mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearAllFilters} className="btn-secondary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.previous}
                      className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const pg = i + 1
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={clsx(
                            'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                            page === pg ? 'bg-nude text-white' : 'bg-white text-charcoal-500 hover:bg-nude-100'
                          )}
                        >
                          {pg}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={!pagination.next}
                      className="btn-secondary py-2 px-4 text-xs disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-medium text-charcoal">Filters</h2>
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <button onClick={() => { clearAllFilters(); setFiltersOpen(false) }} className="text-xs text-nude">
                    Clear all
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="btn-icon">
                  <X size={18} />
                </button>
              </div>
            </div>
            <FilterPanel
              categories={categories}
              searchParams={searchParams}
              onUpdate={(k, v) => { updateFilter(k, v); setFiltersOpen(false) }}
            />
            <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full mt-6">
              Show Results ({pagination.count})
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterAccordion({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-nude-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-medium text-charcoal py-1"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

function FilterPanel({ categories, searchParams, onUpdate }) {
  const [priceMin, setPriceMin] = useState(searchParams.get('min_price') || '')
  const [priceMax, setPriceMax] = useState(searchParams.get('max_price') || '')

  const applyPrice = () => {
    onUpdate('min_price', priceMin)
    onUpdate('max_price', priceMax)
  }

  return (
    <div>
      <FilterAccordion title="Category">
        <div className="space-y-2">
          {categories.slice(0, 10).map(cat => (
            <label key={cat.slug} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={searchParams.get('category') === cat.slug}
                onChange={() => onUpdate('category', cat.slug)}
                className="text-nude focus:ring-nude"
              />
              <span className="text-sm text-charcoal-500 group-hover:text-nude transition-colors">
                {cat.name}
              </span>
              <span className="ml-auto text-xs text-charcoal-300">{cat.product_count}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Price Range">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="input py-2 text-xs"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="input py-2 text-xs"
          />
        </div>
        <button onClick={applyPrice} className="btn-secondary w-full mt-2 py-2 text-xs">
          Apply
        </button>
      </FilterAccordion>

      <FilterAccordion title="Rating">
        {[4, 3, 2].map(r => (
          <label key={r} className="flex items-center gap-2 cursor-pointer mb-2 group">
            <input
              type="radio"
              name="min_rating"
              checked={searchParams.get('min_rating') === String(r)}
              onChange={() => onUpdate('min_rating', String(r))}
              className="text-nude focus:ring-nude"
            />
            <div className="flex items-center gap-1">
              {[...Array(r)].map((_, i) => (
                <span key={i} className="text-amber-400 text-xs">★</span>
              ))}
              <span className="text-sm text-charcoal-500 group-hover:text-nude">& above</span>
            </div>
          </label>
        ))}
      </FilterAccordion>

      <FilterAccordion title="Availability">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.get('in_stock') === 'true'}
            onChange={e => onUpdate('in_stock', e.target.checked ? 'true' : '')}
            className="text-nude focus:ring-nude rounded"
          />
          <span className="text-sm text-charcoal-500">In Stock Only</span>
        </label>
      </FilterAccordion>

      <FilterAccordion title="Collections">
        {[
          { key: 'is_new_arrival', label: 'New Arrivals' },
          { key: 'is_best_seller', label: 'Best Sellers' },
          { key: 'is_featured', label: 'Featured' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={searchParams.get(key) === 'true'}
              onChange={e => onUpdate(key, e.target.checked ? 'true' : '')}
              className="text-nude focus:ring-nude rounded"
            />
            <span className="text-sm text-charcoal-500">{label}</span>
          </label>
        ))}
      </FilterAccordion>
    </div>
  )
}
