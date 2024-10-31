import Image from "next/image";
import Form from "@/components/form";

export default function Login() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-2 text-center sm:px-16">
          <a href="https://arius.vn">
            <Image
              src="/logo.png"
              alt="Arius Logo"
              className="h-16 w-16 rounded-full"
              width={45}
              height={45}
            />
          </a>
        </div>
        <Form type="login" />
      </div>
    </div>
  );
}
