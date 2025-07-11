import { Bot } from "lucide-react";

import ActionButton from "@/components/home/action-button";

const HeroSection = () => (
  <section className="overflow-hidden relative py-16 md:py-32">
    <div className="container px-4 mx-auto md:px-8">
      <div className="grid gap-12 items-center md:grid-cols-2 md:gap-16">
        {/* Content */}
        <div className="mt-8 space-y-8 text-center md:mt-0 md:text-left animate-fade-in-up">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight text-custom-600 md:text-6xl">
              Your AI Agent for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-custom-600 to-custom-900">
                Everything
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg lg:text-xl lg:max-w-none lg:mx-0">
              Transform your business with intelligent automation. Our AI agent
              works 24/7 to provide support, analyze data, and drive decisions
              that matter.
            </p>
          </div>

          <div className="flex flex-col gap-6 justify-center md:flex-row md:justify-start">
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
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r rounded-3xl opacity-20 transform rotate-6 from-custom-500 to-custom-900 animate-pulse-slow"></div>
            <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-2xl md:p-8">
              <div className="flex items-center pb-6 space-x-4 border-b border-gray-100">
                <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br rounded-full from-custom-500 to-custom-900 animate-bounce-slow">
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
                <div className="p-4 ml-8 text-white bg-gradient-to-r rounded-2xl from-custom-500 to-custom-900">
                  <div className="space-y-2">
                    <div className="w-full h-3 rounded-full animate-pulse bg-white/30"></div>
                    <div className="w-2/3 h-3 rounded-full animate-pulse bg-white/20"></div>
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
