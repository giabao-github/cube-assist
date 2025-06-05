import ActionButton from "@/components/home/ActionButton";

const CTASection = () => (
  <section className="relative py-16 overflow-hidden sm:py-20 bg-gradient-to-r from-custom-600 to-custom-900">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="container relative z-10 px-4 mx-auto text-center sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl sm:text-4xl lg:text-5xl">
            Ready to Transform Your Business?
          </h2>
          <p className="max-w-3xl mx-auto text-base leading-relaxed text-blue-100 md:text-lg sm:text-xl">
            Join thousands of companies already using Cube Assist to automate,
            analyze, and accelerate their growth.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-6 md:flex-row">
          <ActionButton
            onClick={() => {}}
            variant="cta"
            className="px-8 py-6 text-lg"
          >
            Start Free Trial
          </ActionButton>
          <ActionButton
            onClick={() => {}}
            variant="outline"
            className="px-8 py-6 text-lg"
          >
            Schedule Demo
          </ActionButton>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
