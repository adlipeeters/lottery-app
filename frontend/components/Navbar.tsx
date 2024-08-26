"use client";

import React from 'react'
import useWalletStore from '@/store/wallet';
import { connectWallet, disconnectWallet, changeWallet } from '@/services/blockchain'
import { truncate } from '@/utils/functions';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';
import { usePathname } from 'next/navigation'

const dashboardLinks = ['/my-lotteries', '/create-lottery', '/dashboard'];
const Navbar = () => {
    const pathname = usePathname();
    const { wallet, setWallet } = useWalletStore();
    return (
        <div className='flex justify-center w-full'>
            <div className="container py-4 rounded-lg border-[2px] flex justify-between items-center mt-2 shadow-sm bg-white">
                <div className='flex justify-between gap-3'>
                    <Link href='/'>
                        <Logo />
                    </Link>
                    <Link
                        className={pathname === '/' ? 'underline font-semibold text-primary' : ''}
                        href='/'>Home</Link>
                    <Link
                        className={dashboardLinks.includes(pathname) ? 'underline font-semibold text-primary' : ''}
                        href='/my-lotteries'>Dashboard</Link>
                </div>
                {wallet ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className='flex items-center gap-2'
                            onClick={changeWallet}>
                            <Wallet className='w-4 h-4' />
                            <span className='hidden md:block'>
                                {truncate({ text: wallet, startChars: 6, endChars: 4, maxLength: 16 })}
                            </span>
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        className='flex items-center gap-2'
                        onClick={connectWallet}>
                        <Wallet className='w-4 h-4' />
                        <span className='hidden md:block'>
                            Connect Wallet
                        </span>
                    </Button>
                )
                }
            </div>
        </div>
    )
}

export default Navbar