const PIXELS = 24;
const STAGGER_MS = 80;

export function RevealDivider() {
  return (
    <div className='about-divider reveal' aria-hidden='true'>
      <div className='div-bar' />
      <div className='div-pixels'>
        {Array.from({ length: PIXELS }).map((_, index) => (
          <span
            key={index}
            style={{ animationDelay: `${index * STAGGER_MS}ms` }}
          />
        ))}
      </div>
      <div className='div-bar' />
    </div>
  );
}
