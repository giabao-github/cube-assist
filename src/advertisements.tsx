import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FiGithub, FiLinkedin } from "react-icons/fi";

import {
  BarChart3,
  Brain,
  Mail,
  MessageSquare,
  Shield,
  Users,
  Zap,
} from "lucide-react";

import analyticsImg from "@/assets/images/analytics-illustration.jpeg";
import chatImg from "@/assets/images/chat-illustration.jpg";
import dashboardImg from "@/assets/images/dashboard-illustration.jpeg";
import emilyImg from "@/assets/images/emily-watson.jpg";
import marcusImg from "@/assets/images/marcus-rodriguez.jpg";
import sarahImg from "@/assets/images/sarah-chen.jpg";

export const runningKeywords = [
  "24/7 Support",
  "Data-Driven Decisions",
  "AI at Your Service",
  "Smart Automation",
  "Instant Insights",
  "Seamless Integration",
];

export const slides = [
  {
    id: 1,
    title: "Dashboard Overview",
    description: "Comprehensive analytics and AI insights at your fingertips",
    image: dashboardImg,
  },
  {
    id: 2,
    title: "Chat Interface",
    description: "Natural conversations with your AI agent",
    image: chatImg,
  },
  {
    id: 3,
    title: "Analytics Panel",
    description: "Real-time data visualization and reporting",
    image: analyticsImg,
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Product Manager at SoftNet",
    content:
      "This AI agent has transformed how we handle customer support. Response times improved by 80%!",
    avatar: sarahImg,
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "CEO at LinkStartup",
    content:
      "The insights we get from this platform are incredible. It's like having a data scientist on demand.",
    avatar: marcusImg,
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "Software Engineer at Skyloft",
    content:
      "Implementation was seamless and the ROI was visible within the first month. Highly recommended!",
    avatar: emilyImg,
    rating: 5,
  },
];

export const capabilities = [
  {
    id: 1,
    icon: <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />,
    title: "Natural Conversations",
    description: "Engage with AI that understands context and nuance",
  },
  {
    id: 2,
    icon: <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />,
    title: "Advanced Analytics",
    description: "Get deep insights from your data with AI-powered analysis",
  },
  {
    id: 3,
    icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />,
    title: "Lightning Fast",
    description: "Instant responses and real-time processing",
  },
  {
    id: 4,
    icon: <Shield className="w-6 h-6 md:w-8 md:h-8" />,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption",
  },
  {
    id: 5,
    icon: <Brain className="w-6 h-6 md:w-8 md:h-8" />,
    title: "Machine Learning",
    description: "Continuously improving AI that learns from your data",
  },
  {
    id: 6,
    icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
    title: "Team Collaboration",
    description: "Share insights and collaborate seamlessly across teams",
  },
];

export const footerSections = [
  {
    title: "Product",
    links: ["Features", "Pricing", "API", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
  },
];

export const socialLinks = [
  { icon: FaXTwitter, href: "#", label: "X" },
  { icon: FiLinkedin, href: "#", label: "LinkedIn" },
  { icon: FiGithub, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Mail" },
];
