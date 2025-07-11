import CarouselIndicators from "@/components/home/carousel-indicators";
import SectionHeader from "@/components/home/section-header";
import { FilterCarousel } from "@/components/ui/filter-carousel";

import { useCarousel } from "@/hooks/use-carousel";

import { slides } from "@/advertisements";

const InteractiveCarousel = () => {
  const { currentIndex, setCurrentIndex, goTo: goToSlide } = useCarousel();

  return (
    <section className="py-16 bg-white md:py-20">
      <div className="container px-4 mx-auto md:px-6 lg:px-8">
        <SectionHeader
          title="See Cube Assist in Action"
          subtitle="Explore our platform's powerful features through interactive screenshots and real use cases"
          className="px-2 pb-12 space-y-6 md:pb-16 md:px-0"
        />

        <div className="flex justify-center mx-auto max-w-6xl">
          <div className="relative md:w-2/3">
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-md md:shadow-xl">
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
