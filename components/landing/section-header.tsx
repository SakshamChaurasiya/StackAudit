import { Eyebrow, Lead, Title } from "@/components/shared/typography";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "mb-12 max-w-2xl",
        isCenter && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <Title className="mb-3">{title}</Title>
      {description && (
        <Lead className={cn(!isCenter && "max-w-xl")}>{description}</Lead>
      )}
    </div>
  );
}
