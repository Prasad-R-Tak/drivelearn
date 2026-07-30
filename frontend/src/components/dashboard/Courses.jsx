export default function Courses({ courses }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Courses</h1>
        <button className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-asphalt hover:text-signal transition-colors">
          Add course
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="text-steel text-sm">No courses yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <div key={c.id} className="border-2 border-asphalt rounded-lg p-5">
              <h3 className="font-display text-2xl mb-1">{c.name}</h3>
              <p className="text-sm text-steel mb-4">{c.duration}</p>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="font-mono font-semibold">₹{c.price.toLocaleString('en-IN')}</span>
                <span className="text-steel">{c.enrolled} enrolled</span>
              </div>
              <button className="w-full border-2 border-asphalt text-sm font-semibold py-2 rounded-md hover:bg-asphalt hover:text-canvas transition-colors">
                Edit course
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}