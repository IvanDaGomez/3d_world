export default function SectionHeading ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <h2
      className='text-4xl md:text-5xl font-black tracking-tight leading-none'
      style={{
        color: '#E2E8F5',
        fontFamily: 'var(--font-display)'
      }}
    >
      {children}
    </h2>
  )
}
