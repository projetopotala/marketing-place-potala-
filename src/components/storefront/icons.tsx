import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function baseProps(props: IconProps): IconProps {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.8-3.2 4.2-4.5 7-4.5s5.2 1.3 7 4.5" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 6h2l1.2 10.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.7L20 9H8" />
      <circle cx="10" cy="20" r="1.2" />
      <circle cx="17" cy="20" r="1.2" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 8h11v9H3V8Z" />
      <path d="M14 11h4.2L21 14.2V17h-7v-6Z" />
      <circle cx="7" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function StarIcon({ filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...baseProps(props)}
      fill={filled ? "currentColor" : "none"}
      strokeWidth={filled ? 0 : 1.6}
    >
      <path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18.4l.9-5.4-3.9-3.8 5.4-.8L12 3.5Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M14 9h2.5V6H14a4 4 0 0 0-4 4v2H8v3h2v6h3v-6h2.2l.5-3H13v-1.5A1.5 1.5 0 0 1 14.5 9" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3" y="7" width="18" height="10" rx="3" />
      <path d="m11 10 4 2-4 2v-4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M11 17.5c.5-2 1.2-4.2 1.6-5.5.3 1 .9 1.5 1.8 1.5 1.8 0 2.9-1.7 2.9-3.8 0-2.3-1.8-4-4.4-4-3 0-4.9 2-4.9 4.4 0 1 .4 2.1 1.2 2.4.2.1.3 0 .3-.2l.3-1.1c0-.2 0-.3-.1-.4-.4-.5-.6-1.1-.6-1.8 0-1.5 1.1-2.8 2.9-2.8 1.6 0 2.5 1 2.5 2.4 0 1.7-.7 2.9-1.7 2.9-.5 0-.9-.4-.7-1l.5-2c.1-.5-.1-1-.8-1-.7 0-1.3.8-1.3 1.8 0 .6.2 1.1.2 1.1L11 17.5Z" />
    </svg>
  );
}

function ornamentalProps(props: IconProps): IconProps {
  return {
    width: 56,
    height: 56,
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

/** Mandala / flor geométrica — Produtos Conscientes */
export function ProductsPillarIcon(props: IconProps) {
  return (
    <svg {...ornamentalProps(props)}>
      <circle cx="32" cy="32" r="6.5" />
      <circle cx="32" cy="32" r="14" />
      <path d="M32 8c3.2 6.8 3.2 14.2 0 21M32 55c-3.2-6.8-3.2-14.2 0-21M8 32c6.8-3.2 14.2-3.2 21 0M55 32c-6.8 3.2-14.2 3.2-21 0" />
      <path d="M16.5 16.5c5.4 5 5.8 12.2 1.2 18.2M47.5 47.5c-5.4-5-5.8-12.2-1.2-18.2M47.5 16.5c-5 5.4-12.2 5.8-18.2 1.2M16.5 47.5c5-5.4 12.2-5.8 18.2-1.2" />
      <path d="M32 14.5 35.2 22 43 23.2 37.2 28.8 38.8 36.5 32 32.8 25.2 36.5 26.8 28.8 21 23.2 28.8 22Z" />
    </svg>
  );
}

/** Geometria de sabedoria / expansão — Saber que Transforma */
export function KnowledgePillarIcon(props: IconProps) {
  return (
    <svg {...ornamentalProps(props)}>
      <path d="M32 8 52 20v24L32 56 12 44V20L32 8Z" />
      <path d="M32 16 44 23v18L32 48 20 41V23L32 16Z" />
      <circle cx="32" cy="32" r="5" />
      <path d="M32 8v8M32 48v8M12 20l7.5 4.5M44.5 39.5 52 44M52 20l-7.5 4.5M19.5 39.5 12 44" />
      <path d="M26 32h12M32 26v12" />
    </svg>
  );
}

/** Sol / mandala radiante — Cura que Acolhe */
export function HealingPillarIcon(props: IconProps) {
  return (
    <svg {...ornamentalProps(props)}>
      <circle cx="32" cy="32" r="9" />
      <circle cx="32" cy="32" r="4.5" />
      <path d="M32 10v6M32 48v6M10 32h6M48 32h6M16.2 16.2l4.2 4.2M43.6 43.6l4.2 4.2M47.8 16.2l-4.2 4.2M20.4 43.6l-4.2 4.2" />
      <path d="M32 18c7.5 0 14 4.2 14 14s-6.5 14-14 14" />
      <path d="M24 22.5c2.2-1.5 4.8-2.3 8-2.3" />
      <path d="M40 41.5c-2.2 1.5-4.8 2.3-8 2.3" />
    </svg>
  );
}

/** União orgânica / comunidade — Comunidade que Inspira */
export function CommunityPillarIcon(props: IconProps) {
  return (
    <svg {...ornamentalProps(props)}>
      <circle cx="32" cy="22" r="5.5" />
      <circle cx="18" cy="40" r="5" />
      <circle cx="46" cy="40" r="5" />
      <path d="M32 27.5c-4.5 3.5-8.5 7.5-10.5 12.5M32 27.5c4.5 3.5 8.5 7.5 10.5 12.5" />
      <path d="M22.5 38.5c3 1.2 6.2 1.8 9.5 1.8s6.5-.6 9.5-1.8" />
      <path d="M26 18c-3.5-2-7.5-2.2-11-.5M38 18c3.5-2 7.5-2.2 11-.5" />
      <path d="M14 46.5c2.5 3.5 6.5 5.5 11 5.5h14c4.5 0 8.5-2 11-5.5" />
    </svg>
  );
}

export function ContentExclusiveIcon(props: IconProps) {
  return (
    <svg {...baseProps({ width: 22, height: 22, ...props })}>
      <path d="M7 5.5h10a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 17V7A1.5 1.5 0 0 1 7 5.5Z" />
      <path d="M9 9.5h6M9 12.5h6M9 15.5h3.5" />
    </svg>
  );
}

export function SpecialOfferIcon(props: IconProps) {
  return (
    <svg {...baseProps({ width: 22, height: 22, ...props })}>
      <path d="M12 4.5 13.8 9l4.7.5-3.5 3.2.9 4.6L12 15.2 7.1 17.3l.9-4.6-3.5-3.2 4.7-.5L12 4.5Z" />
    </svg>
  );
}

export function FirstLaunchIcon(props: IconProps) {
  return (
    <svg {...baseProps({ width: 22, height: 22, ...props })}>
      <path d="M12 4v7.5" />
      <path d="m8.5 8 3.5-3.5L15.5 8" />
      <path d="M7 13.5h10" />
      <path d="M6 17h12" />
    </svg>
  );
}

export function PrivacyShieldIcon(props: IconProps) {
  return (
    <svg {...baseProps({ width: 16, height: 16, ...props })}>
      <path d="M12 3.5 5.5 5.8v5c0 3.2 2.5 5.5 6.5 7 4-1.5 6.5-3.8 6.5-7v-5L12 3.5Z" />
      <path d="m9.2 11.2 1.8 1.8 3.6-3.7" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...baseProps({ width: 18, height: 18, ...props })}>
      <path d="M5.8 18.5 7.2 14.8A7 7 0 1 1 13 19.2a6.9 6.9 0 0 1-3.3-.9l-3.9 1.2Z" />
      <path d="M9.1 9.2c.2-.5.5-.5.8-.5h.3c.3 0 .5.1.6.4l.6 1.5c.1.2 0 .4-.2.5l-.3.4c-.1.1-.1.3 0 .5.5.7 1.1 1.3 1.8 1.7.2.1.4.1.5 0l.4-.4c.1-.1.3-.2.5-.1l1.5.6c.3.1.4.3.4.6v.3c0 .3-.1.5-.5.8-.4.3-1.1.5-1.8.3A5.8 5.8 0 0 1 8.8 10c0-.6.1-1.2.3-.8Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...baseProps({ width: 18, height: 18, ...props })}>
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
      <path d="m5 8.5 7.5 5.2L20 8.5" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...baseProps({ width: 18, height: 18, ...props })}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8.5V12l2.5 2" />
    </svg>
  );
}
