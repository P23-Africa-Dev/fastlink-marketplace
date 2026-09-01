import Image from "next/image";
import Link from "next/link";

import logoSvg from "@/assets/logo.svg";
import { cn } from "@/lib/utils";

type FastlinkLogoProps = {
  href?: string;
  linked?: boolean;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function FastlinkLogo({
  href = "/",
  linked = true,
  className,
  width = 190,
  height = 42,
  priority = false,
}: FastlinkLogoProps) {
  const image = (
    <Image
      src={logoSvg}
      alt="Fastlink Marketplace"
      width={width}
      height={height}
      className={cn("h-10 w-auto object-contain", className)}
      priority={priority}
    />
  );

  if (!linked) {
    return <div className="inline-flex shrink-0 items-center select-none">{image}</div>;
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center select-none"
      aria-label="Fastlink Marketplace"
    >
      {image}
    </Link>
  );
}
