"use client";

import { motion } from "framer-motion";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpForm() {

  const [isSubmitting,setIsSubmitting] = useState(false);
  const [authErr,SetauthErr] = useState<string|null>(null);

  const [verificationErr,setVerificationErr] = useState<string|null>(null);
  const [verificationCode,setVerificationCode] = useState("");
  const [verifying,setVerifying] = useState(false);

  const { signUp } = useSignUp();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState:{errors},
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver:zodResolver(signUpSchema),
    defaultValues:{
      email:"",
      password:"",
      passwordConfirmation:"",
    }
  });

  const { isSignedIn } = useAuth();

  const onSubmit = async (
    data:z.infer<typeof signUpSchema>
  ) => {

    setIsSubmitting(true);
    SetauthErr(null);

    try{

      if(isSignedIn){
        SetauthErr(
          "You are already logged in. Please logout first."
        );
        setIsSubmitting(false);
        return;
      }

      const { error }:any = await signUp.password({
        emailAddress:data.email,
        password:data.password,
      });

      if(error){

        const err = error.errors?.[0];

        if(err?.code==="form_password_pwned"){
          SetauthErr("Weak or compromised password.");
          return;
        }

        if(err?.code==="form_identifier_exists"){
          SetauthErr("User already exists.");
          return;
        }

        SetauthErr(err?.message || "Signup failed");
        return;
      }

      await signUp.verifications.sendEmailCode();

      setVerifying(true);

    } catch{
      SetauthErr("Something went wrong.");
    } finally{
      setIsSubmitting(false);
    }
  };


  const handleVerificationCode = async () => {

    if(!signUp) return;

    setIsSubmitting(true);
    setVerificationErr(null);

    try{

      await signUp.verifications.verifyEmailCode({
        code:verificationCode
      });

      if(signUp.status==="complete"){
        await signUp.finalize({
          navigate:({decorateUrl})=>{
            router.push(
              decorateUrl("/dashboard")
            );
          }
        });
      }else{
        setVerificationErr(
          "Verification incomplete."
        );
      }

    } catch(error:any){

      setVerificationErr(
        error.errors?.[0]?.message ||
        "Verification failed"
      );

    } finally{
      setIsSubmitting(false);
    }
  };


  /* ---------- OTP VERIFY UI ---------- */

  if(verifying){
    return(
      <div className="min-h-screen flex bg-[#050816] text-cyan-50">

        {/* LEFT */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">

          <motion.div
            initial={{opacity:0,y:20}}
            animate={{opacity:1,y:0}}
            className="
            w-full max-w-md
            bg-[#0b1120]
            border border-cyan-500/20
            rounded-3xl p-8
            shadow-[0_0_50px_rgba(34,211,238,.08)]"
          >

            <h2 className="text-3xl font-bold mb-2">
              Verify Email
            </h2>

            <p className="text-cyan-500 mb-6">
              Enter OTP sent to your email
            </p>

            <input
              value={verificationCode}
              onChange={(e)=>
                setVerificationCode(e.target.value)
              }
              placeholder="Enter verification code"
              className="
              w-full px-4 py-3 rounded-xl
              bg-cyan-500/5
              border border-cyan-400/20
              focus:border-cyan-300
              outline-none"
            />

            {verificationErr && (
              <p className="text-red-400 text-sm mt-4">
                {verificationErr}
              </p>
            )}

            <button
              onClick={handleVerificationCode}
              disabled={isSubmitting}
              className="
              w-full mt-6 py-3 rounded-xl
              bg-cyan-400 text-black font-semibold
              shadow-[0_0_25px_rgba(34,211,238,.45)]
              hover:opacity-90 transition"
            >
              {isSubmitting
                ? "Verifying..."
                : "Verify"}
            </button>

          </motion.div>

        </div>


        {/* RIGHT */}
        <div className="hidden lg:flex w-1/2 items-center justify-center relative">

          <div className="absolute w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-3xl"/>

          <h1 className="text-7xl font-bold">
            drop
            <span className="text-cyan-300 drop-shadow-[0_0_25px_rgba(34,211,238,.5)]">
              ly
            </span>
          </h1>

        </div>

      </div>
    );
  }



  /* ---------- SIGNUP UI ---------- */

  return(
    <div className="min-h-screen flex bg-[#050816] text-cyan-50">

      {/* FORM SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{opacity:0,scale:.96}}
          animate={{opacity:1,scale:1}}
          className="
          w-full max-w-md
          bg-[#0b1120]
          border border-cyan-500/20
          rounded-3xl p-8
          shadow-[0_0_50px_rgba(34,211,238,.08)]"
        >

          <h2 className="text-3xl font-bold mb-2">
            Create Account
          </h2>

          <p className="text-cyan-500 mb-6">
            Join Droply today
          </p>


          <div className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="
              w-full px-4 py-3 rounded-xl
              bg-cyan-500/5
              border border-cyan-400/20
              focus:border-cyan-300
              outline-none"
            />

            {errors.email && (
              <p className="text-red-400 text-xs">
                {errors.email.message}
              </p>
            )}


            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="
              w-full px-4 py-3 rounded-xl
              bg-cyan-500/5
              border border-cyan-400/20
              focus:border-cyan-300
              outline-none"
            />


            <input
              type="password"
              placeholder="Confirm Password"
              {...register("passwordConfirmation")}
              className="
              w-full px-4 py-3 rounded-xl
              bg-cyan-500/5
              border border-cyan-400/20
              focus:border-cyan-300
              outline-none"
            />

          </div>


          {authErr && (
            <p className="text-red-400 text-sm mt-4">
              {authErr}
            </p>
          )}


          <button
            type="submit"
            disabled={isSubmitting}
            className="
            w-full mt-6 py-3 rounded-xl
            bg-cyan-400 text-black font-semibold
            hover:opacity-90 transition
            shadow-[0_0_25px_rgba(34,211,238,.45)]"
          >
            {isSubmitting
              ? "Creating..."
              : "Sign Up"}
          </button>


          <p className="text-sm text-cyan-500 mt-5 text-center">
            Already have account?{" "}
            <Link
              href="/sign-in"
              className="text-cyan-300 hover:text-white"
            >
              Sign in
            </Link>
          </p>

        </motion.form>

      </div>


      {/* BRAND SIDE */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative">

        <div className="absolute inset-0 bg-cyan-500/5"/>

        <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl"/>

        <motion.h1
          initial={{opacity:0}}
          animate={{opacity:1}}
          className="text-7xl font-extrabold"
        >
          drop
          <span className="text-cyan-300 drop-shadow-[0_0_30px_rgba(34,211,238,.6)]">
            ly
          </span>
        </motion.h1>

      </div>

    </div>
  );
}