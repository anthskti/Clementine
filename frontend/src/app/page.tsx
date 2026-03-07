"use client";
import { useState } from "react";
import Image from "next/image";
import OnboardingModal from "@/components/home/OnboardingModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-around min-h-screen bg-zinc-50">
      <Image
        src="/assets/home/homepage.jpg"
        alt="Shed Home Page"
        fill
        className="object-cover"
      />
      <div className="flex items-center justify-around z-1">
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative transform transition-all duration-300 hover:scale-105"
        >
          <Image
            src="/assets/home/buttonfinal.png"
            alt="Start Gardening"
            width={400}
            height={400}
            className="object-cover"
          />
        </button>

        <Image
          src="/assets/photos/clementine_standing.png"
          alt="clementine standing"
          width={200}
          height={200}
        />
      </div>

      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
