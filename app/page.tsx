import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen bg-white">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <Image
          width={512}
          height={512}
          src="/logo.png"
          alt="Platforms on Vercel"
          className="w-44 h-44"
        />
        <div className="text-center max-w-screen-sm mb-5">
          <h1 className="text-gray-500 font-bold text-2xl">
            ARIUS Insights Discovery&reg;
          </h1>
          <p className="text-stone-400 mt-5">
            Understand ourselves, understand others & make the most simple things to build trust &#9829;
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard"
            prefetch={false}
            className="text-stone-400 underline hover:text-stone-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" 
                stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" 
                d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
