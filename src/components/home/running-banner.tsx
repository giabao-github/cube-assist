import { Sparkles } from "lucide-react";

import { runningKeywords } from "@/constants/advertisements";

import { useIsMobile } from "@/hooks/use-mobile";

import { chunkArray } from "@/lib/utils";

const RunningBanner = () => {
  const isMobile = useIsMobile();
  const chunkedKeywords = chunkArray(runningKeywords, 3);

  return (
    <div className="py-3 relative overflow-hidden text-white bg-gradient-to-r from-custom-500 via-custom-600 to-custom-700">
      {isMobile ? (
        <div className="relative w-full h-[25px] whitespace-nowrap">
          {Array.from({ length: chunkedKeywords.length }, (_, setIndex) => (
            <div
              key={`banner-set-${setIndex}`}
              className={`absolute inset-0 flex items-center justify-center space-x-12 text-sm font-semibold animate-banner-mobile`}
              style={{
                animationDelay: `${setIndex * 3}s`,
                animationDuration: `${chunkedKeywords.length * 3}s`,
              }}
            >
              {chunkedKeywords[setIndex]?.map((keyword, index) => (
                <div
                  key={`set-${setIndex}-${index}`}
                  className="flex items-center space-x-2 group"
                >
                  <Sparkles className="flex-shrink-0 w-4 h-4 transition-colors group-hover:text-white" />
                  <span className="transition-colors group-hover:text-white">
                    {keyword}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-custom-500 to-transparent"></div>
          <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-custom-900 to-transparent"></div>
          <div className="relative w-full whitespace-nowrap">
            {Array.from({ length: 2 }, (_, setIndex) => (
              <div
                key={`banner-set-${setIndex}`}
                className="w-full animate-slide-left inline-flex items-center space-x-12 text-sm font-semibold md:space-x-24"
              >
                {runningKeywords.map((keyword, index) => (
                  <div
                    key={`set-${setIndex}-${index}`}
                    className="flex items-center space-x-2 group"
                  >
                    <Sparkles className="flex-shrink-0 w-4 h-4 transition-colors group-hover:text-white" />
                    <span className="transition-colors group-hover:text-white">
                      {keyword}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RunningBanner;
