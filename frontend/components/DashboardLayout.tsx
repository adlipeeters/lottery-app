import Link from "next/link"
import { usePathname } from 'next/navigation'
import React from "react"

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen w-full flex-col pt-20">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    {/* <h1 className="text-3xl font-semibold">Dashboard</h1> */}
                </div>
                <div className="mx-auto grid w-full max-w-6x container items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav
                        className="grid gap-4 text-sm text-muted-foreground px-0" x-chunk="dashboard-04-chunk-0"
                    >
                        {/* <Link href="#" className="font-semibold text-primary">
                            General
                        </Link> */}
                        <Link
                            className={pathname === '/my-lotteries' ? 'font-semibold text-primary' : ''}
                            href="/my-lotteries">My Lotteries</Link>
                        <Link
                            className={pathname === '/create-lottery' ? 'font-semibold text-primary' : ''}
                            href="/create-lottery">Create Lottery</Link>
                    </nav>
                    <div className="grid gap-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout;