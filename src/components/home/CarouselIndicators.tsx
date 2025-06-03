import { FC } from "react";

import { Slide, Testimonial } from "@/types";

interface CarouselIndicatorsProps {
  items: (Slide | Testimonial)[];
  currentIndex: number;
  onSelect: (index: number) => void;
  getTitle: (item: Slide | Testimonial) => string;
}

const CarouselIndicators: FC<CarouselIndicatorsProps> = ({
  items,
  currentIndex,
  onSelect,
  getTitle,
}) => (
  <div className="flex justify-center space-x-2">
    {items.map((item, index) => (
      <button
        key={index}
        title={getTitle ? getTitle(item) : `Slide ${index + 1}`}
        onClick={() => onSelect(index)}
        className={`w-3 h-3 cursor-pointer rounded-full transition-all ${
          index === currentIndex
            ? "bg-custom-600 scale-110"
            : "bg-gray-300 hover:bg-gray-400"
        }`}
      />
    ))}
  </div>
);

export default CarouselIndicators;
