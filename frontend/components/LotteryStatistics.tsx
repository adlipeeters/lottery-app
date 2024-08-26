import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Timer, Users } from 'lucide-react'
import Countdown from './Countdown'

interface Props {
    // prize: number,
    ticketPrice: number,
    participants: number,
    winners: number,
    timestamp: number
}

const LotteryStatistics = ({
    // prize,
    ticketPrice,
    participants,
    winners,
    timestamp
}: Props) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total prize
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">ETH {(ticketPrice * participants).toFixed(4)}</div>
                    <p className="text-xs text-muted-foreground">
                        {/* +20.1% from last month */}
                    </p>
                </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Draws in
                    </CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {/* <div className="text-2xl font-bold">{ticketPrice}</div> */}
                    {/* <p className="text-xs text-muted-foreground"> */}
                    {/* +180.1% from last month */}
                    {/* </p> */}
                    <Countdown timestamp={timestamp} />
                </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Participants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{participants}</div>
                    <p className="text-xs text-muted-foreground">
                        +19% from last month
                    </p>
                </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Winners</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{winners}</div>
                    <p className="text-xs text-muted-foreground">
                        +201 since last hour
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default LotteryStatistics