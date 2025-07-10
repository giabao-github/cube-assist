import { Lexend_Deca, Noto_Sans, Poppins } from "next/font/google";

export const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

export const lexend = Lexend_Deca({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export const notosan = Noto_Sans({
  subsets: ["cyrillic", "devanagari", "greek", "latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});
