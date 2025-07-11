# CUBE ASSIST

Cube Assist is a modern SaaS platform that empowers teams and businesses with intelligent AI agents, advanced analytics, and seamless automation. Built with Next.js, TypeScript, and a robust serverless backend, Cube Assist delivers real-time insights, natural language interactions, and secure, scalable infrastructure.

## Features

- **AI Agents**: Create, manage, and interact with custom AI agents tailored to your business needs.
- **Natural Language Conversations**: Engage with AI agents using context-aware, conversational interfaces.
- **Advanced Analytics**: Visualize and analyze your data in real time with interactive dashboards.
- **Team Collaboration**: Share insights and collaborate securely across your organization.
- **Enterprise Security**: End-to-end encryption, role-based access, and secure authentication.
- **Seamless Integration**: Easily connect with your SaaS workflows and tools.

## Tech Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Shadcn, Radix UI
- **Backend**: Next.js API routes, tRPC, Drizzle ORM, Neon Serverless Postgres
- **Authentication**: [better-auth](https://github.com/baotlake/better-auth) (email/password, Google, GitHub)
- **State & Data**: React Query, Zustand, Zod (validation)
- **UI/UX**: Mobile-first, accessible, and highly interactive (Embla Carousel, Framer Motion, Lucide Icons)
- **DevOps**: Vercel-ready, .env for config

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/giabao-github/cube-assist
   cd cube-assist
   ```
2. **Install dependencies:**
   ```bash
   yarn install
   # or npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in required values (see below).
4. **Run the development server:**
   ```bash
   yarn run dev
   # or npm run dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Environment Variables

Create a `.env` file with the following (see `.env.example` if available):

```
DATABASE_URL=...           # Neon Postgres connection string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## Project Structure

- `src/app/` — Next.js App Router pages (auth, dashboard, agents, etc.)
- `src/modules/` — Feature modules (agents, auth, dashboard, home)
- `src/components/` — Reusable UI components (shadcn, custom, utils)
- `src/db/` — Drizzle ORM schema and database setup
- `src/trpc/` — tRPC routers and client/server setup
- `src/lib/` — Auth, utilities, and shared logic

## Deployment

Cube Assist is optimized for Vercel, but can be deployed to any platform supporting Next.js and serverless Postgres (e.g., AWS, Netlify).

## Security & Best Practices

- All user input is validated with Zod.
- Authentication is handled securely via better-auth.
- Sensitive config is managed via `.env` (never commit secrets).
- Follows OWASP and Next.js security guidelines.

## License

MIT

---

> Built with ❤️ by Bao and contributors.
