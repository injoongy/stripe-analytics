"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const getRedirectBase = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: { email: string; redirectTo?: string } = { email };
      const redirectBase = getRedirectBase();

      if (redirectBase) {
        const base = redirectBase.endsWith("/")
          ? redirectBase.slice(0, -1)
          : redirectBase;
        payload.redirectTo = `${base}/reset-password`;
      }

      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.message ??
          errorBody?.error?.message ??
          "Failed to send reset email.";
        throw new Error(message);
      }

      setIsSent(true);
      toast.success("Check your email for the reset link.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to process request.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading || isSent}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 mt-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isSent}
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
            {isSent && (
              <p className="text-xs text-muted-foreground text-center">
                If an account exists for {email}, you&apos;ll receive an email
                with further instructions shortly.
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

