import LotteryStatistics from "@/components/LotteryStatistics"
import LotteryParticipants from "@/components/LotteryParticipants"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Lottery, LotteryResult, Participant } from "@/types"
import { getLottery, getLotteryResult, getLuckyNumbers, getParticipants, getPurchasedNumbers, performDraw } from "@/services/blockchain"
import LotteryLuckyNumbers from "@/components/LotteryLuckyNumbers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleCheck, CircleX, DollarSign, Info, Loader2 } from "lucide-react"
import { truncate } from "@/utils/functions"
import { Button } from "@/components/ui/button"
import useWalletStore from "@/store/wallet"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const LotteryPage = () => {
    const router = useRouter()
    const { wallet } = useWalletStore();
    const { lotteryId } = router.query
    const [loading, setLoading] = useState(false)
    const [lottery, setLottery] = useState<Lottery | null>(null)
    const [luckyNumbers, setLuckyNumbers] = useState<string[]>([])
    const [purchasedNumbers, setPurchasedNumbers] = useState<string[]>([])
    const [participants, setParticipants] = useState<Participant[]>([])
    const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null)
    const [numberOfWinners, setNumberOfWinners] = useState<number>(1)
    const [showPickWinnerButton, setShowPickWinnerButton] = useState<boolean>(false);
    const fetchLottery = async () => {
        try {
            const data = await getLottery(Number(lotteryId));
            setLottery(data)
        } catch (error) {

        }
    }

    const fetchLotteryResult = async () => {
        try {
            const data = await getLotteryResult(Number(lotteryId));
            setLotteryResult(data)
        } catch (error) {

        }
    }

    const fetchLuckyNumbers = async () => {
        try {
            const data = await getLuckyNumbers(Number(lotteryId));
            setLuckyNumbers(data)
        } catch (error) {

        }
    }

    const fetchPurchasedNumbers = async () => {
        try {
            const data = await getPurchasedNumbers(Number(lotteryId));
            setPurchasedNumbers(data)
        } catch (error) {

        }
    }

    const fetchParticipants = async () => {
        try {
            const data = await getParticipants(Number(lotteryId));
            setParticipants(data)
        } catch (error) {

        }
    }

    const pickWinner = async () => {
        if (!numberOfWinners || numberOfWinners < 1) {
            toast.error('Please enter a valid number of winners');
        }
        setLoading(true)
        try {
            const tx = await performDraw(Number(lotteryId), numberOfWinners);
            tx.wait().then(async () => {
                toast.success('Winners picked successfully')
                fetchLottery();
                fetchLotteryResult();
            })
        } catch (error) {
            toast.error('An error occurred');
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (lotteryId) {
            fetchLottery();
            fetchLuckyNumbers();
            fetchPurchasedNumbers();
            fetchParticipants();
            fetchLotteryResult();
        }
    }, [lotteryId])


    useEffect(() => {
        if (lottery &&
            !lottery.drawn &&
            lottery.expiresAt &&
            Date.now() > lottery.expiresAt
            // &&
            // !lotteryResult.requestToChainlinkSent
        ) {
            const timer = setTimeout(() => {
                setShowPickWinnerButton(true);
            }, lottery.expiresAt - Date.now());

            return () => clearTimeout(timer);
        }
    }, [
        lottery
    ]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const shouldPoll = () => {
            // Ensure the lottery has expired and the result is not yet completed
            return lottery && Date.now() > lottery.expiresAt && lotteryResult && !lotteryResult.completed;
        };

        if (shouldPoll()) {
            intervalId = setInterval(() => {
                fetchLottery();
                fetchLotteryResult();
            }, 5000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [
        lottery,
        lotteryResult,
        fetchLotteryResult,
    ]);

    return (
        <div className="flex w-full">
            <div className="container w-full px-0">
                <div className="flex min-h-screen w-full flex-col pt-20">
                    <div className="w-full flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
                        <LotteryStatistics
                            participants={participants.length}
                            winners={lottery?.winners || 0}
                            prize={lottery?.prize || 0}
                            ticketPrice={lottery?.ticketPrice || 0}
                            timestamp={lottery?.expiresAt || 0}
                        />
                        {lotteryResult ?
                            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                                <Card className="col-span-4">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-bold text-green-500">
                                            {lottery?.title}
                                        </CardTitle>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-y-3">
                                        <div className="text-lg font-bold flex flex-col gap-2 items-center"><span>Completed</span> {lotteryResult.completed ? <CircleCheck className="text-green-500" /> : <CircleX className="text-red-500" />}</div>
                                        <div className="text-lg font-bold flex flex-col gap-2 items-center"><span>Paid</span> {lotteryResult.paidout ? <CircleCheck className="text-green-500" /> : <CircleX className="text-red-500" />}</div>
                                        <div className="text-lg font-bold flex flex-col gap-2 items-center"><span>Share per Winner</span> <span className="text-green-500"> ETH {lotteryResult.sharePerWinner}</span></div>
                                        <div className="text-lg font-bold flex flex-col gap-2 items-center justify-center text-center"><span>Winners</span> <div className="">
                                            {lotteryResult.winners.map((winner, index) => (
                                                <div className="grid grid-cols-3 items-center gap-4 text-center" key={index}>
                                                    <p className="text-xs">Account</p>
                                                    <p className="text-xs">Ticket</p>
                                                    <p className="text-xs">Payment Status</p>
                                                    <p className="text-xs">{truncate({ text: winner.account, startChars: 6, endChars: 4, maxLength: 16 })}</p>
                                                    <p key={index} className="text-xs"><span className="text-green-500">{winner.ticket}</span></p>
                                                    <p key={index} className="text-xs">{winner.paid ? <span className="text-green-500">Paid</span> : <span className="text-red-500">Unpaid</span>}</p>
                                                </div>
                                            ))}
                                        </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            : null}
                        {/* {lottery && !lottery.drawn && wallet === lottery.owner && lottery.hasLuckyNumbers  ? */}
                        {/* {lottery && !lottery.drawn && wallet === lottery.owner && lottery.hasLuckyNumbers && Date.now() > lottery.expiresAt ? */}
                        {showPickWinnerButton && wallet === lottery?.owner && lottery?.hasLuckyNumbers ?
                            loading ? (
                                <Button disabled className="bg-green-600">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </Button>) :
                                (
                                    <div className="gap-2 w-full grid grid-cols-12">
                                        <Input
                                            value={numberOfWinners}
                                            onChange={(e) => setNumberOfWinners(Number(e.target.value))}
                                            placeholder="Number of winners"
                                            type="number"
                                            className="col-span-2 w-full border-gray-400" />
                                        <Button
                                            onClick={pickWinner}
                                            className="bg-green-600 col-span-10">Pick winner</Button>
                                    </div>
                                )
                            : null}
                        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                            {lottery ?
                                <>
                                    <LotteryLuckyNumbers
                                        lottery={lottery}
                                        luckyNumbers={luckyNumbers}
                                        purchasedNumbers={purchasedNumbers}
                                        fetchPurchasedNumbers={fetchPurchasedNumbers}
                                        fetchParticipants={fetchParticipants}
                                    />
                                    <LotteryParticipants
                                        participants={participants}
                                        lottery={lottery}
                                    />
                                </>
                                : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default LotteryPage;