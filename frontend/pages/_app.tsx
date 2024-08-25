import CreateLottery from "@/components/CreateLottery";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers/Providers";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {

  return <Providers>
    <div className="fixed z-10 w-full px-2">
      <Navbar />
    </div>
    <div className="px-2">
      <Component {...pageProps} />
    </div>
    <Toaster />
    <CreateLottery />
  </Providers>;
}
