"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRightLong, FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { IoWarningOutline } from "react-icons/io5";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { LoginFields } from "@/components/auth/login-fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { notosan } from "@/config/fonts";

import { SOCIAL_BUTTON_CLASSES } from "@/constants/classes";
import {
  AUTH_FORM_TEXTS,
  BUTTON_TEXTS,
  ERROR_TEXTS,
  SOCIAL_BUTTON_TEXTS,
} from "@/constants/texts";

import { useAuthFormActions } from "@/hooks/use-auth-form-actions";
import { useLoginForm } from "@/hooks/use-login-form";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { loginSchema } from "@/modules/auth/zod-schema";

export const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [changeCount, setChangeCount] = useState(0);

  const { pending, setPending, handleSocialLogin, handleToastMessage } =
    useAuthFormActions({
      onSocialSuccess: () => setPending(false),
    });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { submitButtonText, isButtonDisabled } = useLoginForm(form, pending);

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    setPending(true);
    setHasSubmitted(true);
    form.clearErrors();

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setPending(false);
          form.setError("email", {
            type: "manual",
            message: ERROR_TEXTS.invalidCredentials,
          });
          form.setError("password", {
            type: "manual",
            message: ERROR_TEXTS.invalidCredentials,
          });
          handleToastMessage(error.code);
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("col-span-1 p-6 md:col-span-3 md:p-8", notosan.className)}
      >
        <div className="flex flex-col gap-y-8 md:gap-y-6">
          <div className="flex flex-col gap-y-2 items-center mb-2 text-center md:mb-3">
            <h1 className="text-xl font-bold md:text-2xl text-secondary md:text-gray-900">
              {AUTH_FORM_TEXTS.loginWelcome}
            </h1>
            <p className="text-xs md:text-sm text-secondary/80 md:text-gray-600">
              {AUTH_FORM_TEXTS.loginSubtitle}
            </p>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-1 gap-3 mb-2 md:grid-cols-2">
            <Button
              disabled={pending}
              onClick={() => handleSocialLogin("google")}
              type="button"
              variant="outline"
              className={SOCIAL_BUTTON_CLASSES.google}
            >
              <FcGoogle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {SOCIAL_BUTTON_TEXTS.google}
              </span>
            </Button>
            <Button
              disabled={pending}
              onClick={() => handleSocialLogin("github")}
              type="button"
              variant="outline"
              className={SOCIAL_BUTTON_CLASSES.github}
            >
              <FaGithub className="w-4 h-4" />
              <span className="text-sm font-medium">
                {SOCIAL_BUTTON_TEXTS.github}
              </span>
            </Button>
          </div>

          <div className="relative text-xs text-center after:border-white/20 md:after:border-gray-200 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="relative z-10 px-3 font-medium bg-primary text-secondary/80 md:text-gray-500 md:bg-white">
              {AUTH_FORM_TEXTS.emailLogin}
            </span>
          </div>

          {/* Form fields */}
          <LoginFields
            form={form}
            showPassword={showPassword}
            inputKey={inputKey}
            changeCount={changeCount}
            hasSubmitted={hasSubmitted}
            setShowPassword={setShowPassword}
            setInputKey={setInputKey}
            setChangeCount={setChangeCount}
          />

          {/* Submit button */}
          <Button
            disabled={isButtonDisabled}
            type="submit"
            className="mt-3 w-full h-10 text-sm font-semibold text-black bg-white transition duration-200 md:text-white md:mt-4 md:bg-custom-600 hover:bg-custom-500 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none group"
          >
            {pending ? (
              <span className="flex gap-x-2 items-center">
                <span className="w-4 h-4 rounded-full border-2 animate-spin border-black/20 border-t-black md:border-white/20 md:border-t-white" />
                {BUTTON_TEXTS.pendingLogin}
              </span>
            ) : isButtonDisabled ? (
              <span className="flex gap-x-2 items-center">
                <IoWarningOutline />
                {submitButtonText}
              </span>
            ) : (
              <span className="flex gap-x-2 items-center">
                {submitButtonText}
                <FaArrowRightLong className="group-hover:transform group-hover:translate-x-1 group-active:transform group-active:translate-x-1" />
              </span>
            )}
          </Button>

          {/* Login and recovery links */}
          <div className="text-sm text-center text-secondary/80 md:text-gray-600">
            {`${AUTH_FORM_TEXTS.noAccount} `}
            <Link
              href="/register"
              className="font-semibold transition-all duration-200 text-secondary md:text-primary hover:text-secondary/80 md:hover:text-primary/80 hover:underline"
            >
              {AUTH_FORM_TEXTS.registerNow}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};
