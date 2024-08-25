import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from './ui/button'
import Link from 'next/link'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { Badge } from './ui/badge'
import { Lottery, Participant } from '@/types'
import { buyTicket } from '@/services/blockchain'
import { toast } from 'sonner'

interface Props {
    luckyNumbers: string[]
    purchasedNumbers: string[]
    lottery: Lottery,
    fetchPurchasedNumbers: () => void
    fetchParticipants: () => void
}

const LotteryLuckyNumbers = (
    {
        luckyNumbers,
        purchasedNumbers,
        lottery,
        fetchPurchasedNumbers,
        fetchParticipants
    }: Props
) => {
    const [loading, setLoading] = useState(false)
    const purchaseTicket = async (luckyNumberId: number, ticketPrice: number) => {
        setLoading(true)
        try {
            await buyTicket(lottery.id, luckyNumberId, ticketPrice)
            fetchPurchasedNumbers();
            fetchParticipants();
            toast.success('Ticket purchased successfully')
        } catch (error) {
            toast.error('An error occurred')
        }
        finally {
            setLoading(false)
        }
    }
    return (
        <Card
            className="xl:col-span-2" x-chunk="dashboard-01-chunk-4"
        >
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Lucky numbers</CardTitle>
                    <CardDescription>
                        <Badge color="green">New</Badge> Winning numbers
                    </CardDescription>
                </div>
                {/* <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="#">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button> */}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            {/* <TableHead className="text-right"></TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody className='overflow-y-scroll'>
                        {
                            luckyNumbers.map((number, _key) => (
                                <TableRow key={_key}>
                                    <TableCell>
                                        <div className="font-medium">{number}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {
                                            loading ? (
                                                <Button disabled>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Please wait
                                                </Button>
                                            ) : purchasedNumbers?.includes(number) ? (
                                                <Button
                                                    variant="destructive"
                                                    disabled>
                                                    Purchased
                                                </Button>
                                            ) : (
                                                !lottery.drawn ?
                                                    <Button onClick={() => purchaseTicket(_key, lottery.ticketPrice)}>
                                                        <span className='mr-2'>Buy for</span>
                                                        <span className='text-green-500'>{lottery.ticketPrice} ETH</span>
                                                    </Button> :
                                                    <Button
                                                        disabled>
                                                        <span className='mr-2'>Lottery expired</span>
                                                        {/* <span className='text-green-500'>{lottery.ticketPrice} ETH</span> */}
                                                    </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default LotteryLuckyNumbers