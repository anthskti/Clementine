"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MusicPlayer from "@/components/MusicPlayer";

const navItems = [
  { name: "Import Data", href: "/" },
  { name: "View your Garden", href: "/garden" },
];

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="fixed top-0 left-0 w-full z-20 transition-all duration-300">
      <div className="flex items-center justify-between p-4">
        {/* Logo + Music */}
        <div className="flex justify-around">
          {/* <Image
            src="/assets/home/logo.png"
            alt="Clementine"
            width={80}
            height={80}
            className="object-cover"
          /> */}
          <MusicPlayer />
        </div>
        {/* Navigation */}
        <div>
          <div className="flex items-center justify-between px-4">
            <div className="space-x-6">
              {navItems.map((item) => {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-black hover:text-gray-700"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
