import type { ReactNode } from "react";
import type { IconName } from "@/lib/types";

const PATHS: Record<IconName, ReactNode> = {
  shield: (
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
  ),
  heart: (
    <path d="M12 20s-7-4.3-9.5-8.7C.8 8 2 4.5 5.3 4c2-.3 3.7.7 4.7 2.3C11 4.7 12.7 3.7 14.7 4 18 4.5 19.2 8 17.5 11.3 15 15.7 12 20 12 20Z" />
  ),
  puzzle: (
    <path d="M9 4h4v2.3a1.7 1.7 0 0 0 3 0V4h4v4h-2.3a1.7 1.7 0 0 0 0 3H20v4h-4v-2.3a1.7 1.7 0 0 0-3 0V15H9v-4H6.7a1.7 1.7 0 0 1 0-3H9V4Z" />
  ),
  pulse: <path d="M2 12h4l2-7 4 14 3-11 2 4h5" />,
  brain: (
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h2Zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5h-1a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h-2Z" />
  ),
  handshake: (
    <path d="M2 11l4-4 3 2 3-1.5 3 1.5 3-2 4 4-3 3-2-1.5-2 2h-2l-2-2-2 2H8l-2-2-2 1.5-3-3Z" />
  ),
  sprout: (
    <path d="M12 20v-7m0 0c0-4 3-6 7-6 0 4-2 7-7 6Zm0 0c0-3-2.5-5-6-5 0 3.5 2.5 5.5 6 5Z" />
  ),
  laptop: (
    <path d="M4 5h16v9H4V5Zm-2 12h20l-1.5 2.5h-17L2 17Z" />
  ),
  eye: (
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  ),
  home: <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  repeat: (
    <path d="M4 9a6 6 0 0 1 10-4.5M20 15a6 6 0 0 1-10 4.5M6 5l-2 3-3-2m17 12l2-3 3 2" />
  ),
  warning: (
    <path d="M12 3 2 20h20L12 3Zm0 6.5v5m0 3h.01" />
  ),
  bathtub: (
    <path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3Zm1 0V8a2 2 0 0 1 2-2 2 2 0 0 1 2 2M6 19v1m12-1v1" />
  ),
  basket: <path d="M4 10h16l-2 9H6l-2-9Zm2-1 2-5m8 5-2-5M9 10v6m3-6v6m3-6v6" />,
  target: (
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
  ),
  doc: <path d="M6 3h8l4 4v14H6V3Zm8 0v4h4M9 12h6m-6 4h6" />,
  play: <path d="M6 4l14 8-14 8V4Z" />,
  bulb: (
    <path d="M9 18h6m-5 3h4M8 14a5 5 0 1 1 8 0c-1 1-1.5 2-1.5 3h-5c0-1-.5-2-1.5-3Z" />
  ),
  checkcirc: (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-9 3 3 5-6" />
  ),
  traffic: (
    <path d="M9 2h6v3a3 3 0 0 1-6 0V2Zm-2 5h10v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7Zm3 4h.01M12 11h.01M15 11h.01M12 15h.01" />
  ),
};

export default function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
