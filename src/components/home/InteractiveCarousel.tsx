import CarouselIndicators from "@/components/home/CarouselIndicators";
import SectionHeader from "@/components/home/SectionHeader";

import { useCarousel } from "@/hooks/use-carousel";

import { slides } from "@/advertisements";

import { FilterCarousel } from "../ui/filter-carousel";

const InteractiveCarousel = () => {
  const { currentIndex, setCurrentIndex, goTo: goToSlide } = useCarousel();

  return (
    <section className="py-16 bg-white sm:py-20">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <SectionHeader
          title="See Cube Assist in Action"
          subtitle="Explore our platform's powerful features through interactive screenshots and real use cases"
          className="pb-12 space-y-6 md:pb-16 px-2 md:px-0"
        />

        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="relative md:w-2/3">
            <div className="overflow-hidden shadow-md md:shadow-xl border border-gray-200 rounded-2xl">
              <FilterCarousel
                onSelect={(value) => setCurrentIndex(Number(value))}
                data={slides.map((slide) => ({
                  id: slide.id.toString(),
                  title: slide.title,
                  description: slide.description,
                  image: slide.image,
                }))}
                currentIndex={currentIndex}
              />
            </div>

            {/* Carousel Indicators */}
            <div className="mt-8">
              <CarouselIndicators
                items={slides}
                currentIndex={currentIndex}
                onSelect={goToSlide}
                getTitle={(item) => ("title" in item ? item.title : "")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveCarousel;
