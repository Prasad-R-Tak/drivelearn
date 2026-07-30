import { useState, useMemo, useEffect } from 'react'
import { Star, MapPin, Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import LaneDivider from '../components/LaneDivider'

const ratingOptions = [
  { label: 'Any rating', value: 0 },
  { label: '4.0+', value: 4.0 },
  { label: '4.5+', value: 4.5 },
]

const priceOptions = [
  { label: 'Any price', value: Infinity },
  { label: 'Under ₹4,000', value: 4000 },
  { label: 'Under ₹5,000', value: 5000 },
]

export default function SchoolSearch() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [city, setCity] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(Infinity)

  useEffect(() => {
    fetch('http://localhost:5000/api/schools')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load schools')
        return res.json()
      })
      .then((data) => setSchools(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    return schools.filter((s) => {
      const matchesCity =
        city.trim() === '' ||
        s.city.toLowerCase().includes(city.toLowerCase()) ||
        s.locality.toLowerCase().includes(city.toLowerCase())
      const matchesRating = s.rating >= minRating
      const matchesPrice = s.price <= maxPrice
      return matchesCity && matchesRating && matchesPrice
    })
  }, [schools, city, minRating, maxPrice])

  return (
    <div className="min-h-screen bg-canvas text-asphalt">
      <Navbar />

      {/* Search header */}
      <section className="bg-asphalt text-canvas">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="font-display text-5xl mb-6">Find your driving school</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" size={18} />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search by city or locality"
              className="w-full bg-canvas text-asphalt pl-10 pr-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-signal"
            />
          </div>
        </div>
        <LaneDivider />
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <aside className="md:w-56 shrink-0">
          <h2 className="font-display text-xl mb-4">Filters</h2>

          <div className="mb-6">
            <label className="block text-xs font-mono text-steel mb-2 tracking-wide">
              RATING
            </label>
            <div className="flex flex-col gap-2">
              {ratingOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setMinRating(opt.value)}
                  className={`text-left text-sm px-3 py-2 rounded-md border-2 transition-colors ${
                    minRating === opt.value
                      ? 'border-signal bg-signal/10 font-semibold'
                      : 'border-steel/30 text-steel'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-steel mb-2 tracking-wide">
              PRICE
            </label>
            <div className="flex flex-col gap-2">
              {priceOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setMaxPrice(opt.value)}
                  className={`text-left text-sm px-3 py-2 rounded-md border-2 transition-colors ${
                    maxPrice === opt.value
                      ? 'border-signal bg-signal/10 font-semibold'
                      : 'border-steel/30 text-steel'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {loading && <p className="text-steel text-sm">Loading schools…</p>}

          {error && (
            <div className="border-2 border-brake rounded-lg p-6 text-brake text-sm">
              Couldn't load schools: {error}. Make sure the backend server is running on port 5000.
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-steel text-sm mb-4 font-mono">
                {results.length} {results.length === 1 ? 'school' : 'schools'} found
              </p>

              {results.length === 0 ? (
                <div className="border-2 border-dashed border-steel/40 rounded-lg p-10 text-center text-steel">
                  No schools match your filters. Try widening your search.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {results.map((s) => (
                    <div
                      key={s.id}
                      className="border-2 border-asphalt rounded-lg p-5 hover:bg-signal/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-xl leading-tight pr-2">{s.name}</h3>
                        <span className="flex items-center gap-1 text-sm font-mono shrink-0">
                          <Star size={14} className="fill-signal text-signal" />
                          {s.rating}
                        </span>
                      </div>
                      <p className="flex items-center gap-1 text-sm text-steel mb-3">
                        <MapPin size={14} />
                        {s.locality}, {s.city}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {s.courses.map((c) => (
                          <span
                            key={c}
                            className="text-xs font-mono border border-steel/40 text-steel rounded px-2 py-0.5"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">
                          From <span className="font-semibold">₹{s.price.toLocaleString('en-IN')}</span>
                        </span>
                        <button className="bg-asphalt text-canvas text-sm font-semibold px-4 py-2 rounded-md hover:bg-signal hover:text-asphalt transition-colors">
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}