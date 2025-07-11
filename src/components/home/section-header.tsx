import { FC } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  className = "",
}) => (
  <div className={`space-y-4 text-center ${className}`}>
    <h2 className="text-2xl font-bold leading-tight md:text-3xl lg:text-4xl 2xl:text-5xl">
      {title}
    </h2>
    {subtitle && (
      <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600 md:text-lg lg:text-xl">
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;
