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
  <div className={`text-center space-y-4 ${className}`}>
    <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
      {title}
    </h2>
    {subtitle && (
      <p className="max-w-3xl mx-auto text-base leading-relaxed text-gray-600 md:text-lg">
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;
