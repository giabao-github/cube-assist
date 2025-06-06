import { type NextRequest, NextResponse } from "next/server";

// Mock data for suggestions
const mockSuggestions = [
  "React hooks tutorial",
  "React state management",
  "React performance optimization",
  "React testing best practices",
  "React component patterns",
  "Next.js app router",
  "Next.js server components",
  "Next.js API routes",
  "Next.js deployment",
  "Next.js middleware",
  "TypeScript with React",
  "TypeScript interfaces",
  "TypeScript generics",
  "TypeScript utility types",
  "JavaScript ES6 features",
  "JavaScript async await",
  "JavaScript promises",
  "JavaScript array methods",
  "CSS Grid layout",
  "CSS Flex box",
  "CSS animations",
  "Tailwind CSS components",
  "Tailwind CSS utilities",
  "Node.js express",
  "Node.js authentication",
  "Database design patterns",
  "API design best practices",
  "Web performance optimization",
  "SEO optimization",
  "Responsive web design",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // If no query, return all suggestions
  if (!query) {
    return NextResponse.json({
      suggestions: mockSuggestions.slice(0, 8),
      query: "",
    });
  }

  // Validate query length
  if (query.length > 100) {
    return NextResponse.json({
      suggestions: [],
      query: query,
      error: "Search input is limited to 100 characters",
    });
  }

  // Filter suggestions based on query
  const filteredSuggestions = mockSuggestions
    .filter((suggestion) =>
      suggestion.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 8);

  return NextResponse.json({
    suggestions: filteredSuggestions,
    query,
  });
}
