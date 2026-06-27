export default function SectionLabel ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <p
      className='uppercase text-[11px] tracking-[0.2em] font-bold mb-3'
      style={{ color: '#1E4FD8' }}
    >
      {children}
    </p>
  )
}
