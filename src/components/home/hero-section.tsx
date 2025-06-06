import { Bot } from "lucide-react";

import ActionButton from "@/components/home/action-button";

const HeroSection = () => (
  <section className="relative py-16 overflow-hidden md:py-32">
    <div className="container px-4 mx-auto md:px-8">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Content */}
        <div className="mt-8 space-y-8 text-center md:mt-0 md:text-left animate-fade-in-up">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight text-custom-600 md:text-6xl">
              Your AI Agent for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-custom-600 to-custom-900">
                Everything
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base leading-relaxed text-gray-600 md:text-lg sm:text-xl lg:max-w-none lg:mx-0">
              Transform your business with intelligent automation. Our AI agent
              works 24/7 to provide support, analyze data, and drive decisions
              that matter.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-6 md:flex-row md:justify-start">
            <ActionButton
              onClick={() => {}}
              variant="primary"
              className="px-8 py-6 text-lg"
            >
              Start Free Trial
            </ActionButton>
            <ActionButton
              onClick={() => {}}
              variant="secondary"
              className="px-8 py-6 text-lg border-2 border-custom-600"
            >
              Watch Demo
            </ActionButton>
          </div>
        </div>

        {/* Animated Illustration */}
        <div className="relative order-first md:order-last">
          <div className="relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 transform bg-gradient-to-r from-custom-500 to-custom-900 rounded-3xl rotate-6 animate-pulse-slow opacity-20"></div>
            <div className="relative p-6 bg-white border border-gray-100 shadow-2xl sm:p-8 rounded-3xl">
              <div className="flex items-center pb-6 space-x-4 border-b border-gray-100">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-custom-500 to-custom-900 animate-bounce-slow">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-16 h-2 bg-gray-100 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="pt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl animate-float">
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-3/4 h-3 bg-gray-100 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="p-4 ml-8 text-white bg-gradient-to-r from-custom-500 to-custom-900 rounded-2xl">
                  <div className="space-y-2">
                    <div className="w-full h-3 rounded-full bg-white/30 animate-pulse"></div>
                    <div className="w-2/3 h-3 rounded-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
