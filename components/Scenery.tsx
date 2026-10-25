/** 画面の下に重ねる、遠い山並みと杉林のシルエット。 */
export function Ridges() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-56 w-full"
      viewBox="0 0 1200 240"
      preserveAspectRatio="none"
    >
      <path
        d="M0 150 L120 90 L210 130 L340 50 L470 125 L560 85 L690 140 L810 60 L930 130 L1040 80 L1200 140 V240 H0Z"
        fill="var(--ridge-far)"
      />
      <path
        d="M0 190 L90 150 L190 180 L300 120 L410 175 L520 140 L640 185 L760 130 L880 180 L990 145 L1100 185 L1200 160 V240 H0Z"
        fill="var(--ridge-mid)"
      />
      <path
        d="M0 225 L60 205 L110 222 L170 195 L230 224 L300 200 L360 226 L430 205 L500 228 L580 200 L650 226 L720 208 L800 228 L880 202 L950 226 L1030 206 L1110 227 L1200 210 V240 H0Z"
        fill="var(--ridge-near)"
      />
    </svg>
  );
}

/** ロゴ: 山と杉。 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <path d="M1 27 L11 9 L17 19 L21 13 L31 27Z" fill="var(--primary)" opacity="0.35" />
      <path d="M22 27 V24 M22 24 L17.5 24 L22 15 L26.5 24Z" fill="var(--primary)" stroke="var(--primary)" strokeWidth="1" strokeLinejoin="round" />
      <path d="M11 27 L11 22 M11 22 L7.5 22 L11 14 L14.5 22Z" fill="var(--primary)" stroke="var(--primary)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** カードの上に添える、細い稜線の飾り。 */
export function RidgeLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 240 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20 L38 8 L58 16 L92 4 L124 17 L150 9 L184 18 L206 11 L238 20" />
    </svg>
  );
}
