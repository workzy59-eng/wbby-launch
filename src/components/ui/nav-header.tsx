"use client"; 

import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function NavHeader({ className }: { className?: string }) {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className={cn(
        "relative mx-auto flex w-fit rounded-full border-2 border-[#E6FF00] bg-black/20 backdrop-blur-xl p-1",
        className
      )}
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      <Tab setPosition={setPosition} href="/">Home</Tab>
      <Tab setPosition={setPosition} href="/#how-it-works">How It Works</Tab>
      <Tab setPosition={setPosition} href="/about">About</Tab>
      <Tab setPosition={setPosition} href="/services">Services</Tab>
      <Tab setPosition={setPosition} href="/pricing">Pricing</Tab>
      <Tab setPosition={setPosition} href="/blog">Blog</Tab>
      <Tab setPosition={setPosition} href="/contact">Contact</Tab>

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({
  children,
  setPosition,
  href,
}: {
  children: React.ReactNode;
  setPosition: any;
  href: string;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;

        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-[10px] font-black uppercase italic tracking-widest text-white mix-blend-difference md:px-5 md:py-3 md:text-xs"
    >
      <Link to={href}>{children}</Link>
    </li>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-7 rounded-full bg-[#E6FF00] md:h-10"
    />
  );
};

export default NavHeader;
