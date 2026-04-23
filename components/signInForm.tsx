"use client";

import { signInSchema } from "@/schemas/signInSchema";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function SignInForm() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { isSignedIn, signOut } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErr, setAuthErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    setAuthErr(null);

    try {
      if (isSignedIn) await signOut();

      await signIn?.create({
        identifier: data.identifier,
        password: data.password,
      });

      if (signIn?.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) =>
            router.push(decorateUrl("/dashboard")),
        });
      } else {
        setAuthErr("Invalid credentials");
      }
    } catch (err: any) {
      const code = err?.errors?.[0]?.code;

      if (code === "form_identifier_not_found") {
        setAuthErr("No account found with this email");
      } else if (code === "form_password_incorrect") {
        setAuthErr("Incorrect password");
      } else {
        setAuthErr("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050816] text-cyan-50 overflow-hidden">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center">

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-[#050816] to-blue-500/10"/>

        {/* glow blobs */}
        <div className="absolute w-[450px] h-[450px] bg-cyan-500/10 blur-3xl rounded-full top-16 left-12"/>
        <div className="absolute w-[350px] h-[350px] bg-blue-500/10 blur-3xl rounded-full bottom-10 right-10"/>

        <div className="relative z-10 max-w-lg space-y-8">

          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles className="w-5 h-5"/>
            <span className="text-xs tracking-[0.3em] uppercase">
              Secure Cloud Storage
            </span>
          </div>

          <h1 className="text-6xl font-bold leading-tight">
            Welcome Back
            <br/>
            to{" "}
            <span className="text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,.5)]">
              Droply
            </span>
          </h1>

          <p className="text-cyan-100/60 leading-relaxed">
            Access your files anywhere with encrypted,
            high-speed storage built for modern workflows.
          </p>

          <div className="h-px bg-cyan-500/20"/>

          <p className="text-sm text-cyan-500">
            Trusted by developers, creators and teams.
          </p>

        </div>
      </div>


      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6">

        <motion.div
          initial={{opacity:0,y:30}}
          animate={{opacity:1,y:0}}
          className="w-full max-w-md"
        >

          {/* Logo */}
          <div className="mb-10 text-center">
            <Link href="/">
              <h1 className="text-3xl font-semibold tracking-tight">
                drop
                <span className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,.5)]">
                  ly
                </span>
              </h1>
            </Link>

            <p className="text-cyan-500 mt-2 text-sm">
              Sign in to continue
            </p>
          </div>


          {/* FORM CARD */}
          <div
            className="
            relative rounded-3xl p-8
            bg-[#0b1120]
            border border-cyan-500/20
            shadow-[0_0_50px_rgba(34,211,238,.08)]"
          >

            <div className="absolute inset-0 rounded-3xl bg-cyan-500/5 blur-2xl"/>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative space-y-6"
            >

              {/* EMAIL */}
              <div>
                <label className="text-xs uppercase tracking-widest text-cyan-500">
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-cyan-500"/>

                  <input
                    {...register("identifier")}
                    placeholder="you@example.com"
                    className="
                    w-full pl-10 pr-4 py-3 rounded-xl
                    bg-cyan-500/5
                    border border-cyan-400/20
                    focus:border-cyan-300
                    outline-none transition"
                  />
                </div>

                {errors.identifier && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.identifier.message}
                  </p>
                )}
              </div>


              {/* PASSWORD */}
              <div>
                <label className="text-xs uppercase tracking-widest text-cyan-500">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-cyan-500"/>

                  <input
                    type="password"
                    {...register("password")}
                    placeholder="••••••••"
                    className="
                    w-full pl-10 pr-4 py-3 rounded-xl
                    bg-cyan-500/5
                    border border-cyan-400/20
                    focus:border-cyan-300
                    outline-none transition"
                  />
                </div>

                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>


              {/* ERROR */}
              {authErr && (
                <div className="
                p-3 rounded-xl
                bg-red-500/10
                border border-red-500/20
                text-red-300 text-sm">
                  {authErr}
                </div>
              )}


              {/* BUTTON */}
              <button
                disabled={isSubmitting}
                className="
                w-full py-3 rounded-xl font-semibold
                bg-cyan-400 text-black
                hover:opacity-90 transition
                shadow-[0_0_25px_rgba(34,211,238,.5)]
                flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4"/>
                  </>
                )}
              </button>


              {/* Footer */}
              <div className="text-center text-sm text-cyan-500">
                New here?{" "}
                <Link
                  href="/sign-up"
                  className="text-cyan-300 hover:text-white"
                >
                  Create account
                </Link>
              </div>

            </form>

          </div>

          <p className="text-xs text-cyan-600 text-center mt-6">
            By continuing you agree to our Terms & Privacy Policy
          </p>

        </motion.div>
      </div>

    </div>
  );
}