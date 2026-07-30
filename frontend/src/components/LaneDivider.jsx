export default function LaneDivider({ className = "" }) {
  return (
    <div
      className={`h-[3px] w-full ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--color-signal) 0 28px, transparent 28px 56px)",
      }}
    />
  )
}