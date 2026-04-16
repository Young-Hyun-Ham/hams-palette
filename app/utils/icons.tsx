import type { SVGProps } from "react";

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    />
  );
}

export function EmojiPickerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="11.5" cy="13" r="1.4" fill="currentColor" />
      <circle cx="20.5" cy="13" r="1.4" fill="currentColor" />
      <path
        d="M11 18.2C12.4 20.4 14 21.5 16 21.5C18 21.5 19.6 20.4 21 18.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 9.6L6.7 8M23.7 9.6L25.3 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AlignLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 7H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 11H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 15H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 19H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function AlignCenterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 7H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 11H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 15H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 19H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function AlignRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 7H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 11H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 15H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 19H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function UndoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9 8L5 12L9 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12H14C16.7614 12 19 14.2386 19 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function RedoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M15 8L19 12L15 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12H10C7.23858 12 5 14.2386 5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function BoldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9 6H13.5C15.433 6 17 7.567 17 9.5C17 11.433 15.433 13 13.5 13H9V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 13H14C15.933 13 17.5 14.567 17.5 16.5C17.5 18.433 15.933 20 14 20H9V13Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ItalicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M14 5H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 19H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.5 5L10.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function StrikeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 12H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7.5C9 6.67157 10.3431 6 12 6C13.6569 6 15 6.67157 15 7.5C15 8.32843 13.6569 9 12 9C10.3431 9 9 9.67157 9 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 13.5C15 14.3284 13.6569 15 12 15C10.3431 15 9 15.6716 9 16.5C9 17.3284 10.3431 18 12 18C13.6569 18 15 17.3284 15 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function BackgroundColorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M6 7.5H18V12.5H6V7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 14.5H17L18.5 19H5.5L7 14.5Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function ImageSelectIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect
        x="4.5"
        y="6"
        width="15"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7.5 15L11 11.5L13.8 14.3L15.8 12.3L19.5 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="9.5" r="1.2" fill="currentColor" />
    </IconBase>
  );
}
