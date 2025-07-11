import { useCallback, useState } from "react";

import { Star } from "lucide-react";
import Image from "next/image";

import CarouselIndicators from "@/components/home/carousel-indicators";
import SectionHeader from "@/components/home/section-header";

import { useCarousel } from "@/hooks/use-carousel";

import { testimonials } from "@/advertisements";

const TestimonialsSection = () => {
  const { currentIndex, goTo } = useCarousel();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < testimonials.length - 1) {
      goTo(currentIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  }, [touchStart, touchEnd, currentIndex, goTo]);

  return (
    <section className="py-16 bg-white md:py-20">
      <div className="container px-4 mx-auto md:px-6 lg:px-8">
        <SectionHeader
          title="What Our Customers Say"
          subtitle="Join thousands of satisfied customers who have transformed their business with Cube Assist"
          className="px-2 pb-12 space-y-6 md:pb-16 md:px-0"
        />

        <div className="relative mx-auto max-w-4xl">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-full">
                  <div className="p-6 space-y-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl md:p-8">
                    <div className="flex justify-center space-x-1">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <blockquote className="text-base italic leading-relaxed text-gray-800 md:text-lg xl:text-xl">
                      {`"${testimonial.content}"`}
                    </blockquote>
                    <div className="flex justify-center items-center space-x-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                      />
                      <div className="space-y-1 text-left">
                        <div className="font-semibold text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <CarouselIndicators
              items={testimonials}
              currentIndex={currentIndex}
              onSelect={goTo}
              getTitle={(testimonial) =>
                "name" in testimonial ? testimonial.name : ""
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
