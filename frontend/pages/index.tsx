import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import HelloExample from "@/components/HelloExample";
import { useEffect, useState } from "react";
import { getLotteries, createLottery } from "@/services/blockchain";
import { Lotteries } from "@/components/Lotteries";
import { Hero } from "@/components/Hero";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const [lotteries, setLotteries] = useState([]);

  const fetchLotteries = async () => {
    const lottories = await getLotteries();
    setLotteries(lottories);
  }
  useEffect(() => {
    fetchLotteries();
  }, [])

  return (
    <main
      className={`${inter.className}`}>
      <Hero />
      <Lotteries lotteries={lotteries} />
    </main>
  );
}

export default Home;