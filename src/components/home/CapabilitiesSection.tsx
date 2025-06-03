import SectionHeader from "@/components/home/SectionHeader";

import { capabilities } from "@/advertisements";

const CapabilitiesSection = () => (
  <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
    <div className="container px-4 mx-auto sm:px-6 lg:px-8">
      <SectionHeader
        title="Powerful Capabilities"
        subtitle="Discover what makes our AI agent the perfect solution for your business needs"
        className="pb-12 space-y-6 md:pb-16"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
        {capabilities.map((capability) => (
          <div
            key={capability.id}
            className="p-4 transition-all duration-300 bg-white border border-gray-100 shadow-lg md:p-6 group rounded-2xl hover:shadow-xl hover:-translate-y-2"
          >
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-center w-10 h-10 transition-transform duration-300 md:w-16 md:h-16 bg-gradient-to-br from-custom-500 to-custom-900 rounded-xl md:rounded-2xl group-hover:scale-110">
                <div className="text-white">{capability.icon}</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-base font-bold text-gray-900 md:text-xl">
                  {capability.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                  {capability.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CapabilitiesSection;
