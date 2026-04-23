"use client";

import { useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  Zap,
  Lock,
  Cloud,
} from "lucide-react";

import Link from "next/link";

export default function Home() {

  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#050816] text-cyan-50 relative overflow-hidden">

      {/* BACKGROUND GLOWS */}
      <div className="absolute inset-0">

        <div className="
        absolute top-[-220px] left-[-220px]
        w-[550px] h-[550px]
        bg-cyan-500/10 blur-[140px]
        rounded-full"/>

        <div className="
        absolute bottom-[-220px] right-[-220px]
        w-[550px] h-[550px]
        bg-blue-500/10 blur-[140px]
        rounded-full"/>

      </div>



      {/* NAV */}
      <nav className="
      relative z-10
      border-b border-cyan-500/20
      bg-[#050816]/70 backdrop-blur-xl">

        <div className="
        max-w-7xl mx-auto
        px-6 py-5
        flex items-center justify-between">

          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            drop
            <span className="
            text-cyan-300
            drop-shadow-[0_0_18px_rgba(34,211,238,.6)]">
              ly
            </span>
          </Link>


          {isSignedIn ? (

            <Link
              href="/dashboard"
              className="
              px-5 py-2 rounded-xl
              bg-cyan-400 text-black font-semibold
              shadow-[0_0_20px_rgba(34,211,238,.45)]
              hover:opacity-90 transition"
            >
              Dashboard
            </Link>

          ) : (

            <div className="flex gap-3">

              <Link
                href="/sign-up"
                className="
                px-5 py-2 rounded-xl
                bg-cyan-400 text-black font-semibold
                shadow-[0_0_20px_rgba(34,211,238,.45)]
                hover:opacity-90 transition"
              >
                Get Started
              </Link>

              <Link
                href="/sign-in"
                className="
                px-5 py-2 rounded-xl
                border border-cyan-400/30
                bg-cyan-500/5
                hover:bg-cyan-500/10
                transition"
              >
                Login
              </Link>

            </div>

          )}

        </div>

      </nav>



      {/* HERO */}
      <section className="
      relative z-10
      max-w-7xl mx-auto
      px-6 pt-28 md:pt-36 pb-24">

        <div className="max-w-4xl">

          <div className="
          inline-flex items-center gap-2
          px-4 py-2 rounded-full
          border border-cyan-400/20
          bg-cyan-500/5
          text-cyan-300 text-xs mb-8">

            <span className="w-2 h-2 rounded-full bg-cyan-300"/>

            Secure Cloud Storage

          </div>


          <h1 className="
          text-5xl md:text-7xl
          font-bold leading-tight">

            Store your files
            <br/>

            with{" "}

            <span className="
            text-cyan-300
            drop-shadow-[0_0_25px_rgba(34,211,238,.5)]">
              simplicity.
            </span>

          </h1>


          <p className="
          text-cyan-100/60
          text-lg mt-6
          max-w-xl leading-relaxed">

            Upload, organize, access and protect
            your files from anywhere using fast,
            encrypted cloud storage.

          </p>


          <div className="mt-10 flex gap-4">

            <Link
              href="/sign-in"
              className="
              px-7 py-3 rounded-xl
              bg-cyan-400 text-black font-semibold
              shadow-[0_0_25px_rgba(34,211,238,.5)]
              hover:opacity-90
              flex items-center gap-2"
            >
              Start Free
              <ArrowRight className="w-4 h-4"/>
            </Link>

          </div>

        </div>

      </section>



      {/* FEATURES */}
      <section
        id="features"
        className="
        relative z-10
        max-w-7xl mx-auto
        px-6 py-20"
      >

        <h2 className="
        text-4xl md:text-5xl
        font-bold mb-14">

          Everything you need for{" "}

          <span className="text-cyan-300">
            storage
          </span>

        </h2>


        <div className="grid md:grid-cols-3 gap-6">

          {features.map((f,i)=>(
            <div
              key={i}
              className="
              p-7 rounded-3xl
              bg-[#0b1120]
              border border-cyan-500/20
              hover:border-cyan-300/30
              hover:shadow-[0_0_25px_rgba(34,211,238,.12)]
              transition"
            >

              <div className="
              mb-5 text-cyan-300">
                {f.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3">
                {f.title}
              </h3>

              <p className="text-cyan-100/60 text-sm">
                {f.description}
              </p>

            </div>
          ))}

        </div>

      </section>




      {/* ABOUT */}
      <section
        id="about"
        className="
        relative z-10
        max-w-7xl mx-auto
        px-6 py-20"
      >

        <div className="
        grid md:grid-cols-2 gap-12 items-center">

          <div>

            <h2 className="
            text-4xl font-bold mb-5">

              Built for modern{" "}

              <span className="text-cyan-300">
                teams
              </span>

            </h2>

            <p className="
            text-cyan-100/60
            leading-relaxed">

              Droply removes friction from file
              management with secure infrastructure,
              speed and modern collaboration.

            </p>

          </div>


          <div className="grid grid-cols-2 gap-4">

            <div className="
            p-6 rounded-2xl
            bg-[#0b1120]
            border border-cyan-500/20">
              <Cloud className="
              w-5 h-5 text-cyan-300 mb-2"/>
              Cloud First
            </div>

            <div className="
            p-6 rounded-2xl
            bg-[#0b1120]
            border border-cyan-500/20">
              <Lock className="
              w-5 h-5 text-cyan-300 mb-2"/>
              Secure
            </div>

            <div className="
            p-6 rounded-2xl
            bg-[#0b1120]
            border border-cyan-500/20">
              <Zap className="
              w-5 h-5 text-cyan-300 mb-2"/>
              Fast
            </div>

          </div>

        </div>

      </section>




      {/* FOOTER */}
      <footer className="
      relative z-10
      border-t border-cyan-500/20
      py-10 text-center
      text-cyan-600">

        © 2026 Droply. All rights reserved.

      </footer>

    </div>
  );
}



const features = [
  {
    icon:<Cloud/>,
    title:"Cloud Storage",
    description:
      "Store and access files anywhere securely."
  },

  {
    icon:<Zap/>,
    title:"Fast Uploads",
    description:
      "Lightning-fast upload and sync system."
  },

  {
    icon:<Lock/>,
    title:"Privacy First",
    description:
      "Encrypted secure storage built for privacy."
  },
];