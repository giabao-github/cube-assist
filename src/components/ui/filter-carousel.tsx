"use client";

import { useEffect, useState } from "react";

import Image, { StaticImageData } from "next/image";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { cn } from "@/lib/utils";

interface FilterCarouselProps {
  isLoading?: boolean;
  currentIndex?: number;
  onSelect: (value: string | null) => void;
  data: {
    id: string;
    title: string;
    description: string;
    image: StaticImageData;
  }[];
}

export const FilterCarousel = ({
  isLoading,
  onSelect,
  data,
  currentIndex,
}: FilterCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (api && currentIndex !== undefined) {
      api.scrollTo(currentIndex);
    }
  }, [api, currentIndex]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelectHandler = () => {
      const selectedIndex = api.selectedScrollSnap();
      onSelect(selectedIndex.toString());
    };

    api.on("select", onSelectHandler);

    onSelectHandler();

    return () => {
      api.off("select", onSelectHandler);
    };
  }, [api, onSelect]);

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          dragFree: true,
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {!isLoading &&
            data.map((item) => {
              return (
                <CarouselItem
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="pl-3 basis-auto relative cursor-pointer group"
                >
                  {/* Desktop image */}
                  <div className="hidden md:block relative overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.title ?? ""}
                      width={768}
                      height={512}
                      className={cn(
                        "object-cover transition-transform duration-300 select-none",
                      )}
                    />
                    <div className="absolute space-y-0 text-white md:space-y-1 bottom-6 left-6 right-6 bg-neutral-100/90 w-fit p-4 rounded-lg">
                      <h3 className="text-base text-gray-800 font-bold md:text-lg">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-800 leading-tight md:leading-relaxed md:text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="md:hidden relative overflow-hidden rounded-md">
                    {/* Mobile image */}
                    <Image
                      src={item.image}
                      alt={item.title ?? ""}
                      width={399}
                      height={266}
                      className={cn(
                        "object-cover transition-transform duration-300 select-none",
                      )}
                    />
                  </div>
                </CarouselItem>
              );
            })}
        </CarouselContent>
        <CarouselPrevious className="cursor-pointer ml-3 md:ml-2 left-0 z-10 bg-white/50 text-black/70 hover:bg-white hover:text-black active:bg-white/70 active:text-black/70" />
        <CarouselNext className="cursor-pointer mr-3 md:mr-2 right-0 z-10 bg-white/50 text-black/70 hover:bg-white hover:text-black active:bg-white/70 active:text-black/70" />
      </Carousel>
    </div>
  );
};
