import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  id?: string;
  as?: "h2" | "h3";
  tone?: "dark" | "light";
  align?: "left" | "center";
  action?: ReactNode;
  ornament?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  id,
  as = "h2",
  tone = "dark",
  align = "left",
  action,
  ornament = false,
  className = "",
}: SectionHeadingProps) {
  const Tag = as;
  const color = tone === "dark" ? "text-potala-text" : "text-potala-bg";
  const alignment =
    align === "center"
      ? "text-center justify-center"
      : "text-left justify-between";

  return (
    <div className={`mb-8 flex flex-wrap items-end gap-4 ${alignment} ${className}`}>
      <div className={align === "center" ? "mx-auto max-w-2xl" : ""}>
        {ornament ? (
          <div className="mb-3 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-10 bg-potala-gold/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-potala-gold" />
            <span className="h-px w-10 bg-potala-gold/50" />
          </div>
        ) : null}
        <Tag
          id={id}
          className={`font-serif text-3xl leading-tight tracking-tight md:text-4xl ${color}`}
        >
          {title}
        </Tag>
      </div>
      {action}
    </div>
  );
}
