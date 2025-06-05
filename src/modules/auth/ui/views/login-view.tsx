"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export const LoginView = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      },
    );
  };

  const onLoginSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-0 overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center mb-4 text-center gap-y-2">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account
                  </p>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="At least 8 characters"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {!!error && (
                  <Alert className="border-none bg-destructive/10">
                    <CircleAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                <Button disabled={pending} type="submit" className="w-full">
                  Sign in
                </Button>
                <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="relative z-10 px-2 bg-card text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    disabled={pending}
                    onClick={() => onLoginSocial("google")}
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    Google
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => onLoginSocial("github")}
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    Github
                  </Button>
                </div>
                <div className="text-sm text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold hover:text-custom-700"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          <div className="relative flex-col items-center justify-center hidden bg-radial from-sidebar-accent to-sidebar md:flex gap-y-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={96}
              height={96}
              className="w-24 h-24"
            />
            <p className="text-2xl font-semibold text-white">Cube Assist</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:hover:text-custom-700">
        By continuing, you are agreeing to our{" "}
        <Link href="#" className="font-semibold">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="font-semibold">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
};
