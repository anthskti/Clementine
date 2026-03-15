import Image from "next/image";
import Sign from "@/components/home/Sign";

export default function Home() {
  return (
    <div className="relative flex items-center justify-around h-screen overflow-hidden bg-zinc-50">
      {/* Background Shed */}
      <Image
        src="/assets/home/homepage.jpg"
        alt="HomePage"
        fill
        className="object-cover"
      />
      {/* Main Information */}
      <div className="flex items-center justify-content z-1 p-6">
        {/* LEFT: Import sign information */}
        <div>
          <Sign />
        </div>
        {/* RIGHT: Image of Clementine */}

        <div className="p-50">
          <Image
            src="/assets/photos/clementine_standing.png"
            alt="ClementineStanding"
            width={150}
            height={150}
          />
        </div>
      </div>
    </div>
  );
}
