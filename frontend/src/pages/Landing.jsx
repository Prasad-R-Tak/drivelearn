import Navbar from '../components/Navbar'
import LaneDivider from '../components/LaneDivider'
import { Link } from 'react-router-dom'
// import { Link } from 'react-router-dom'

const steps = [
  { n: '01', label: 'Search', desc: 'Find schools near you by city and locality.' },
  { n: '02', label: 'Compare', desc: 'Check pricing, ratings, and instructor reviews.' },
  { n: '03', label: 'Book', desc: 'Reserve your slot and pay securely online.' },
  { n: '04', label: 'Learn', desc: 'Track lessons, attendance, and progress.' },
  { n: '05', label: 'Get licensed', desc: 'Finish your course, ready for your test.' },
]

const features = [
  { title: 'Verified schools', desc: 'Every school on DriveLearn is checked before it goes live.' },
  { title: 'Instant booking', desc: 'Pick a slot and pay in a few taps — no phone calls needed.' },
  { title: 'Progress tracking', desc: 'See exactly how many lessons you have left and what you\u2019ve covered.' },
  { title: 'Real reviews', desc: 'Ratings from learners who actually finished their course.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas text-asphalt">
      <Navbar />

      {/* Hero */}
      <section className="bg-asphalt text-canvas">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <p className="font-mono text-xs text-signal tracking-widest mb-4">
            LICENSED IN 30–45 DAYS, ON AVERAGE
          </p>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.95] mb-6">
            Learn to drive.<br />The right way.
          </h1>
          <p className="text-steel text-lg max-w-xl mb-10 font-body">
            Search, compare, and book verified driving schools near you —
            then track every lesson until you're ready for your test.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/schools" className="bg-signal text-asphalt font-semibold px-6 py-3 rounded-md hover:bg-white transition-colors">
              Find a driving school
            </Link>
            <Link to="/login?mode=signup&role=owner" className="border border-steel text-canvas font-semibold px-6 py-3 rounded-md hover:border-signal hover:text-signal transition-colors">
  List your school
</Link>
          </div>
        </div>
        <LaneDivider />
      </section>

      {/* Route / steps */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-4xl mb-2">The route to your license</h2>
        <p className="text-steel mb-12">Five stops. One platform.</p>

        <div className="grid md:grid-cols-5 gap-8">
          {steps.map((step, i) => (
            <div key={step.n} className="relative">
              <span className="font-mono text-sm text-brake">{step.n}</span>
              <h3 className="font-display text-2xl mt-1 mb-2">{step.label}</h3>
              <p className="text-sm text-steel">{step.desc}</p>
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-2 left-[calc(100%+8px)] w-[calc(100%-16px)] h-[2px]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, var(--color-steel) 0 6px, transparent 6px 12px)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <LaneDivider className="opacity-30" />

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-4xl mb-12">Built for learners</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="border-2 border-asphalt rounded-lg p-6 hover:bg-signal/10 transition-colors"
            >
              <h3 className="font-display text-2xl mb-2">{f.title}</h3>
              <p className="text-steel text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For schools CTA */}
      <section id="for-schools" className="bg-route text-canvas">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl mb-2">Run a driving school?</h2>
            <p className="text-canvas/80 max-w-md">
              Manage students, instructors, and bookings in one dashboard —
              and get discovered by learners near you.
            </p>
          </div>
          <Link to="/login?mode=signup&role=owner" className="bg-signal text-asphalt font-semibold px-6 py-3 rounded-md hover:bg-white transition-colors whitespace-nowrap">
  List your school
</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-asphalt text-steel">
        <LaneDivider className="opacity-20" />
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm">
          <span className="font-display text-2xl text-signal">DriveLearn</span>
          <span className="font-mono text-xs">© 2026 DriveLearn India</span>
        </div>
      </footer>
    </div>
  )
}