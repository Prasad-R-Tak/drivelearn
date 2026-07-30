import { students } from '../../data/ownerData'

export default function Students() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Students</h1>
        <button className="bg-signal text-asphalt text-sm font-semibold px-4 py-2 rounded-md hover:bg-asphalt hover:text-signal transition-colors">
          Add student
        </button>
      </div>

      <div className="border-2 border-asphalt rounded-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr] px-5 py-3 bg-asphalt text-canvas text-xs font-mono tracking-wide">
          <span>NAME</span>
          <span>COURSE</span>
          <span>PROGRESS</span>
          <span>STATUS</span>
        </div>
        {students.map((s, i) => (
          <div
            key={s.id}
            className={`grid grid-cols-[2fr_1fr_1.5fr_1fr] items-center px-5 py-4 text-sm ${
              i !== students.length - 1 ? 'border-b border-asphalt/20' : ''
            }`}
          >
            <span className="font-medium">{s.name}</span>
            <span className="text-steel">{s.course}</span>
            <div className="flex items-center gap-2 pr-4">
              <div className="flex-1 h-1.5 bg-asphalt/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
              <span className="font-mono text-xs text-steel w-8">{s.progress}%</span>
            </div>
            <span
              className={`text-xs font-semibold w-fit px-2 py-1 rounded ${
                s.status === 'Completed' ? 'bg-route/10 text-route' : 'bg-signal/20 text-asphalt'
              }`}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}