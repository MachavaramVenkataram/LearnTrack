"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setIsMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
          : "bg-white/70 backdrop-blur-xs border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/30 group-hover:bg-blue-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              LearnTrack
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#product"
            onClick={(e) => handleSmoothScroll(e, "#product")}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Product
          </a>
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, "#features")}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleSmoothScroll(e, "#how-it-works")}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            How It Works
          </a>
          <a
            href="#analytics"
            onClick={(e) => handleSmoothScroll(e, "#analytics")}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Analytics
          </a>
          <a
            href="#simulator"
            onClick={(e) => handleSmoothScroll(e, "#simulator")}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Simulator
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all font-semibold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />}
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-600">
            <a
              href="#product"
              onClick={(e) => handleSmoothScroll(e, "#product")}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Product
            </a>
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "#features")}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSmoothScroll(e, "#how-it-works")}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#analytics"
              onClick={(e) => handleSmoothScroll(e, "#analytics")}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Analytics
            </a>
            <a
              href="#simulator"
              onClick={(e) => handleSmoothScroll(e, "#simulator")}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Simulator
            </a>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full">
              <Button variant="primary" className="w-full justify-center">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
