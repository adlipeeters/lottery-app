import DashboardLayout from '@/components/DashboardLayout'
import ImportLuckyNumbers from '@/components/ImportLuckyNumbers'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { getMyLotteries } from '@/services/blockchain'
import useLotteryStore from '@/store/lottery'
import { Lottery } from '@/types'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'

const dinamicProperties = [
    { property: "prize", label: "Prize" },
    { property: "ticketPrice", label: "Ticket price" },
    { property: "participants", label: "Participants" },
    { property: "drawsAt", label: "Draws at" },
    { property: "drawn", label: "Drawn" },
    { property: "winners", label: "Winners" },
    { property: "participants", label: "Participants" },
]

const NyLotteries = () => {
    const { myLotteries: lotteries } = useLotteryStore();
    // const lotteries = useLotteryStore(state => state.myLotteries);
    const [lotteryImportId, setLotteryImportId] = useState<number>(0);
    // const [lotteries, setLotteries] = useState<Lottery[]>([]);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const fetchLotteries = async () => {
        // const lotteries = await getMyLotteries();
        // setLotteries(lotteries);
        await getMyLotteries();
    }
    useEffect(() => {
        fetchLotteries();
    }, [])

    const handleKeyData = (key: string, data: Lottery): string | number | boolean => {
        switch (key) {
            case 'drawn':
                return data[key] === true ? 'Yes' : 'No'
            default:
                return data[key]
        }
    }

    const handleImportModal = (id: number) => {
        setLotteryImportId(id);
        setImportModalOpen(true);
    }

    return (
        <DashboardLayout>
            <Card x-chunk="dashboard-04-chunk-2">
                <CardHeader>
                    <CardTitle>My lotteries</CardTitle>
                    <CardDescription>
                    </CardDescription>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-3'>
                    {lotteries.map((lottery: Lottery, index) => (
                        <Card className={``} key={index}>
                            <CardHeader>
                                <Link href={`/lottery/${lottery.id}`} key={index}>
                                    <CardTitle>{lottery.title}</CardTitle>
                                    <CardDescription>{lottery.description}</CardDescription>
                                </Link>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div>
                                    <div
                                        className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                                    >
                                        {
                                            dinamicProperties.map((property, index) => (
                                                <Fragment
                                                    key={index}
                                                >
                                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium leading-none">
                                                            {property.label}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {handleKeyData(property.property, lottery)}
                                                        </p>
                                                    </div>
                                                </Fragment>
                                            ))
                                        }
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {!lottery.hasLuckyNumbers ?
                                    <Button className="w-full relative z-10" onClick={() => handleImportModal(lottery.id)}>
                                        <Check className="mr-2 h-4 w-4" /> Import lucky numbers
                                    </Button>
                                    :
                                    null}
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                </CardFooter>
            </Card >
            <ImportLuckyNumbers
                id={lotteryImportId}
                setLotteryImportId={setLotteryImportId}
                open={importModalOpen}
                setOpen={setImportModalOpen}
            />
        </DashboardLayout >
    )
}

export default NyLotteries