import ActionButton from "@/components/home/action-button";

const CTASection = () => (
  <section className="overflow-hidden relative py-16 bg-gradient-to-r md:py-20 from-custom-600 to-custom-900">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="container relative z-10 px-4 mx-auto text-center md:px-6 lg:px-8">
      <div className="mx-auto space-y-8 max-w-4xl">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl 2xl:text-5xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-blue-100 md:text-lg lg:text-xl">
            Join thousands of companies already using Cube Assist to automate,
            analyze, and accelerate their growth.
          </p>
        </div>

        <div className="flex flex-col gap-6 justify-center md:flex-row">
          <ActionButton
            onClick={() => {}}
            variant="cta"
            className="px-12 py-6 text-base md:text-lg"
          >
            Start Free Trial
          </ActionButton>
          <ActionButton
            onClick={() => {}}
            variant="outline"
            className="px-12 py-6 text-base md:text-lg"
          >
            Schedule Demo
          </ActionButton>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
