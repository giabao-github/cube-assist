import { Lexend_Deca, Noto_Sans, Poppins } from "next/font/google";

export const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const lexend = Lexend_Deca({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export const notosan = Noto_Sans({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["cyrillic", "devanagari", "greek", "latin", "vietnamese"],
  display: "swap",
});
