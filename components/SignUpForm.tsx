"use client";

import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { signUpSchema } from "@/schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

export default function SignUpFrom() {
  const { isLoaded, setActive, signUp } = useSignUp();

  const router = useRouter();

  const [verifying, setVerifying] = useState<boolean>(false);
  const [submitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string | null>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", passwordConfirmation: "" },
  });

  console.log(errors);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) {
      return null;
    }
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signUp?.create({
        emailAddress: data?.email,
        password: data?.password,
      });
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerifying(true);
    } catch (error) {
      if (error) {
        console.log("Signup error", error);
        setAuthError(
          error?.errors?.[0]?.message ||
            "An Error Occured during signup.Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    if (!isLoaded && !signUp) {
      return;
    }
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      console.log(result);
      if ((result.status = "complete")) {
        await setActive({ session: result.createdSessionId });
        console.log("succssssssssssssssssssssD");
        router.push("/dashboard");
      } else {
        setVerificationError("verification incomplete");
        console.log("verification incomplete");
      }
    } catch (error) {
      console.log("Signup error", error);
      setVerificationError(
        error?.errors?.[0]?.message ||
          "An Error Occured during signup.Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      {verifying ? (
        <>
          <CardHeader>
            <CardTitle>Account Verification</CardTitle>
            <CardDescription>
              Enter code sent to your email below to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerificationSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="code">Verification Code</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Resend Code
                    </a>
                  </div>
                  <Input
                    id="code"
                    type="text"
                    required
                    value={verificationCode}
                    maxLength={6}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
              </div>
              <CardFooter className="flex-col gap-2 pt-5">
                <Button type="submit" className="w-full">
                  Confirm
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">Sign Up</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <div>{errors.email?.message}</div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    {...register("email")}
                  />
                  <div className="text-xs text-red-400 font-semibold">
                    {errors.email?.message}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {/* <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    {...register("password")}
                    maxLength={8}
                  />
                  <div className="text-xs text-red-400 font-semibold">
                    {errors.password?.message}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="confirmpassword">Confirm Password</Label>
                    {/* <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a> */}
                  </div>
                  <Input
                    id="confirmpassword"
                    type="password"
                    required
                    {...register("passwordConfirmation")}
                    maxLength={8}
                  />
                  <div className="text-xs text-red-400 font-semibold">
                    {errors.passwordConfirmation?.message}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              onClick={handleSubmit(onSubmit)}
            >
              Login
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
