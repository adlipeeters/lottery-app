import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Lottery, Participant } from '@/types'
import { truncate } from '@/utils/functions'

interface Props {
    participants: Participant[],
    lottery: Lottery
    // fetchPurchasedNumbers: () => void
}
const LotteryParticipants = ({ participants, lottery }: Props) => {
    return (
        <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
                <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
                {participants.map((participant, index) => (
                    <div className="flex items-center gap-4" key={index}>
                        {/* <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src="/avatars/01.png" alt="Avatar" />
                            <AvatarFallback>{participant.account.toUpperCase()}</AvatarFallback>
                        </Avatar> */}
                        {participant.lotteryNumber}
                        <div className="grid gap-1 ml-4">
                            <p className="text-sm font-medium leading-none">
                                {truncate({ text: participant.account.toUpperCase(), startChars: 6, endChars: 4, maxLength: 16 })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {participant.paid}
                            </p>
                        </div>
                        <div className="ml-auto font-medium">{lottery.ticketPrice} ETH</div>
                    </div>
                ))}

            </CardContent>
        </Card>
    )
}

export default LotteryParticipants