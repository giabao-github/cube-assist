import { capabilities, slides, testimonials } from "@/constants/advertisements";

export type Slide = (typeof slides)[number];

export type Testimonial = (typeof testimonials)[number];

export type Capability = (typeof capabilities)[number];
