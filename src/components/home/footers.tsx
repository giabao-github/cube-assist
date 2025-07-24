import Link from "next/link";

import Logo from "@/components/home/logo";

import { footerSections, socialLinks } from "@/constants/advertisements";

import { useIsMobile } from "@/hooks/use-mobile";

const Footer = () => {
  const isMobile = useIsMobile();

  return (
    <footer className="py-16 text-white bg-gray-900">
      <div className="container px-4 mx-auto md:px-6 lg:px-8">
        <div className={`${isMobile ? "space-y-24" : "flex justify-between"}`}>
          {/* Brand Section */}
          <div className={`${isMobile ? "space-y-6" : "space-y-6 max-w-sm"}`}>
            <Logo isWhite className="justify-center md:justify-start" />
            <p className="leading-relaxed text-center text-gray-300 md:text-left">
              Empowering businesses with intelligent AI agents that work around
              the clock.
            </p>
            <div className="flex justify-center space-x-6 md:justify-start">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-gray-400 transition-colors duration-300 transform hover:text-white hover:scale-110 active:text-white active:scale-110"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div
            className={`grid ${isMobile ? "grid-cols-2 gap-14" : "grid-cols-3 gap-32"}`}
          >
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-gray-400">
                  {section.links.map((link) => (
                    <li
                      key={link}
                      className="text-sm tracking-wide text-center"
                    >
                      <Link
                        href="#"
                        className="transition-colors duration-300 hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 mt-12 text-center text-gray-400 border-t border-gray-800">
          <p>&copy; 2025 Cube Assist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
