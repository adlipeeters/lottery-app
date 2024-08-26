import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./button";
import { ShoppingCart, Ticket } from "lucide-react";
import { truncate } from "@/utils/functions";

export const HoverEffect = ({
    items,
    className,
}: {
    items: {
        title: string;
        description: string;
        link?: string;
        image?: string;
        [key: string]: any;
    }[];
    className?: string;
}) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
                className
            )}
        >
            {items.map((item, idx) => (
                <Link
                    key={idx}
                    //   href={i}
                    href={`/lottery/${item.id}`}
                    className="relative group  block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block  rounded-3xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <Card className="flex flex-col justify-end h-full">
                        <div className="">
                            <div className="flex w-full justify-center">
                                <Image
                                    className="max-h-[150px] w-auto object-contain"
                                    src={item.image || ""}
                                    alt={""}
                                    width={200}
                                    height={200}
                                />
                            </div>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                            <CardDescription><span className="font-bold">Owner:</span> {truncate({ text: item.owner, startChars: 6, endChars: 4, maxLength: 16 })}</CardDescription>
                            <CardDescription><span className="font-bold">Prize:</span> {(item.ticketPrice * item.participants).toFixed(4)} ETH</CardDescription>
                        </div>
                        <div className="flex justify-end">
                            <Button className="">
                                <Ticket />
                            </Button>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export const Card = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-4 overflow-hidden bg-white shadow-sm border border-transparent dark:border-white/[0.2] group-hover:border-slate- relative z-20",
                className
            )}
        >
            <div className="relative z-50">
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};
export const CardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        // <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
        <h4 className={cn("text-gray-500 font-bold tracking-wide mt-4", className)}>
            {children}
        </h4>
    );
};
export const CardDescription = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <p
            className={cn(
                // "mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm",
                "mt-8 tracking-wide leading-relaxed text-sm",
                className
            )}
        >
            {children}
        </p>
    );
};
