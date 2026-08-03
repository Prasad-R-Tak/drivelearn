export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-asphalt/60 flex items-center justify-center z-50 px-4">
      <div className="bg-canvas rounded-lg border-2 border-asphalt max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-2xl">{title}</h3>
          <button
            onClick={onClose}
            className="text-steel hover:text-asphalt text-2xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}