import { Lottery } from '@/types'
import React from 'react'

import { HoverEffect } from "./ui/card-hover-effect";

export function Lotteries(
    { lotteries }: { lotteries: Lottery[] }
) {
    return (
        <div className="max-w-5xl mx-auto px-8">
            <HoverEffect items={lotteries} />
        </div>
    );
}