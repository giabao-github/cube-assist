"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

/* 
  Error codes:
    INVALID_EMAIL
    PASSWORD_TOO_SHORT
    USER_ALREADY_EXISTS
    INVALID_EMAIL_OR_PASSWORD
*/

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { 
    data: session, 
    // isPending,
    // error,
    // refetch
  } = authClient.useSession() 

  const onSignUp = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsPending(true);
    authClient.signUp.email({
      email,
      name,
      password,
    }, {
      onError: (ctx) => {
        toast.error(ctx.error.message, {
          description: ctx.error.code
        });
      },
      onSuccess: () => {
        toast.success("Signed up successfully");
      },
    });
    setIsPending(false);
  };

  const onLogIn = () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsPending(true);
    authClient.signIn.email({
      email,
      password,
    }, {
      onError: (ctx) => {
        toast.error(ctx.error.message, {
          description: ctx.error.code
        });
      },
      onSuccess: () => {
        toast.success("Logged in successfully");
      },
    });
    setIsPending(false);
  };

  if (session) {
    return (
      <div className="max-w-full">
        <div className="w-1/3 p-4 my-4 flex flex-col gap-y-8 justify-center items-center mx-auto">
          <p className="text-xl font-semibold">Hello, {session.user.name}!</p>
          <Button
            onClick={() => authClient.signOut()}
            className="cursor-pointer"
          >
            Sign out
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full flex flex-col gap-y-12">
      <div className="w-1/3 p-4 my-4 flex flex-col gap-y-4 justify-center items-center mx-auto">
        <h1 className="text-3xl font-bold my-4">Create an account</h1>
        <Input 
          placeholder="Your full name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          placeholder="Password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          onClick={onSignUp}
          disabled={isPending}
          className="cursor-pointer"
        >
          {isPending ? "Loading..." : "Sign up"}
        </Button>
      </div>
      <div className="w-1/3 p-4 my-4 flex flex-col gap-y-4 justify-center items-center mx-auto">
        <h1 className="text-3xl font-bold my-4">Sign in</h1>
        <Input 
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          placeholder="Password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          onClick={onLogIn}
          disabled={isPending}
          className="cursor-pointer"
        >
          {isPending ? "Loading..." : "Sign in"}
        </Button>
      </div>
    </div>
  );
}
