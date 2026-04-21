import type { ReactNode } from "react";

export function Reveal({
  children,
  index = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "section" | "span" | "li" | "p";
  y?: number;
}) {
  const style = {
    animationDelay: `${index * 90}ms`,
  } as React.CSSProperties;

  const props = {
    className: "reveal-on-load " + className,
    style,
  };

  if (Tag === "section") return <section {...props}>{children}</section>;
  if (Tag === "span") return <span {...props}>{children}</span>;
  if (Tag === "li") return <li {...props}>{children}</li>;
  if (Tag === "p") return <p {...props}>{children}</p>;
  return <div {...props}>{children}</div>;
}

export function Stagger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}) {
  return <div className={"stagger-children " + className}>{children}</div>;
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  index?: number;
}) {
  return <div className={className}>{children}</div>;
}
