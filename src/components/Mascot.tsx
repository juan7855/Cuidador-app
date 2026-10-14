/**
 * Mascota de la identidad visual: forma orgánica, ojos grandes y colores
 * planos (verde principal, mejillas naranja, acento turquesa).
 */
export default function Mascot({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Panela"
    >
      {/* hoja turquesa */}
      <path d="M43 9c5-4 11-3 13 1-2 5-8 7-13 5z" fill="#329caf" />
      {/* cuerpo */}
      <path
        d="M32 8c15 0 25 11 25 25 0 14-10 23-25 23S7 47 7 33C7 19 17 8 32 8z"
        fill="#31836f"
      />
      {/* ojos */}
      <ellipse cx="23" cy="30" rx="6" ry="7" fill="#fff" />
      <ellipse cx="41" cy="30" rx="6" ry="7" fill="#fff" />
      <circle cx="24.5" cy="31.5" r="3.2" fill="#303f49" />
      <circle cx="42.5" cy="31.5" r="3.2" fill="#303f49" />
      <circle cx="25.7" cy="30.2" r="1" fill="#fff" />
      <circle cx="43.7" cy="30.2" r="1" fill="#fff" />
      {/* mejillas y sonrisa */}
      <circle cx="15" cy="42" r="3.6" fill="#d58c56" opacity=".85" />
      <circle cx="49" cy="42" r="3.6" fill="#d58c56" opacity=".85" />
      <path
        d="M27 43c2.6 3 7.4 3 10 0"
        fill="none"
        stroke="#f5f1e6"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
