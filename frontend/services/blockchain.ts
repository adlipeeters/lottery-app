import { ethers } from 'ethers'
import address from '@/contracts/Lottery/Lottery_Address.json'
import abi from '@/contracts/Lottery/Lottery_Abi.json'
import useWalletStore from '@/store/wallet';
import { CreateLottery } from '@/types';
import useLotteryStore from '@/store/lottery';
import { config } from 'dotenv';
config();  // This should be at the very top of your main file

const { setWallet } = useWalletStore.getState();
const ContractAddress = address.contract_address
const ContractAbi = abi.abi

// !TODO
let ethereum: any
// !TODO
let tx: any

if (typeof window !== 'undefined') {
    ethereum = (window as any).ethereum
}

const toWei = (num: string | number) => ethers.utils.parseEther(num.toString())
const fromWei = (num: string | number) => ethers.utils.formatEther(num)

const getReadOnlyContract = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_APP_RPC_URL);
    const readOnlyContract = new ethers.Contract(ContractAddress, ContractAbi, provider);
    return readOnlyContract;
}

const getWriteContract = async () => {
    if (!ethereum) {
        return reportError("Ethereum provider not found. Please install MetaMask or a similar wallet.");
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const writeContract = new ethers.Contract(ContractAddress, ContractAbi, signer);
    return writeContract;
}


const connectWallet = async () => {
    console.log('Connecting wallet...')
    try {
        if (!ethereum) return reportError('Please install Metamask')
        const accounts = await ethereum.request?.({ method: 'eth_requestAccounts' })
        setWallet(accounts?.[0])
    } catch (error) {
        reportError(error)
    }
}

const disconnectWallet = async () => {
    try {
        if (!ethereum) return reportError('Please install Metamask');

        setWallet('');

        ethereum.removeAllListeners('accountsChanged');
        ethereum.removeAllListeners('chainChanged');

        console.log('Wallet disconnected');
    } catch (error) {
        reportError(error);
    }
}

const changeWallet = async () => {
    try {
        console.log('Ethereum object:', ethereum);
        if (!ethereum) return reportError('Please install MetaMask');

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) return reportError('No accounts returned');
        setWallet(accounts[0]);
        console.log('Wallet changed to:', accounts[0]);
    } catch (error) {
        console.error('Error changing wallet:', error);
        reportError(error);
    }
};


const checkWallet = async () => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        const accounts = await ethereum.request?.({ method: 'eth_accounts' })

        ethereum.on('chainChanged', () => {
            window.location.reload();
        })

        ethereum.on('accountsChanged', async () => {
            window.location.reload();
        })

        if (accounts?.length) {
            setWallet(accounts[0]);
            await getMyLotteries();
        } else {
            setWallet('')
            reportError('Please connect wallet, no accounts found.')
        }
    } catch (error) {
        reportError(error)
    }
}

const createLottery = async ({ title, description, imageUrl, prize, ticketPrice, expiresAt }: CreateLottery) => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        // const wallet = useWalletStore.getState().wallet
        const contract = await getWriteContract();
        if (!contract) return reportError("Error creating contract");
        tx = await contract.createLottery(
            title,
            description,
            imageUrl,
            toWei(prize),
            toWei(ticketPrice),
            expiresAt,
            // {
            //     from: wallet,
            // }
        )
        tx.wait()
        tx.wait().then(async () => {
            await getMyLotteries();
        })
    } catch (error) {
        // console.log(error)
        reportError(error)
    }
}

const importLuckyNumbers = async (id: number, luckyNumbers: string[]) => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        const wallet = useWalletStore.getState().wallet
        // const contract = await getEthereumContract()
        const contract = await getWriteContract();
        if (!contract) return reportError("Error creating contract");

        tx = await contract.importLuckyNumbers(id, luckyNumbers,
            // {
            //     from: wallet,
            // }
        );
        tx.wait()
            .then(async () => {
                await getMyLotteries();
            })

    } catch (error) {
        reportError(error)
    }
}

const buyTicket = async (id: number, luckyNumberId: number, ticketPrice: number) => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        // const wallet = useWalletStore.getState().wallet
        const contract = await getWriteContract();
        if (!contract) return reportError("Error creating contract");
        tx = await contract.buyTicket(id, luckyNumberId,
            {
                value: toWei(ticketPrice),
            })
        tx.wait()
    } catch (error) {
        reportError(error)
    }
}

const performDraw = async (id: number, numberOfWinners: number) => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        // const wallet = useWalletStore.getState().wallet
        const contract = await getWriteContract();
        if (!contract) return reportError("Error creating contract");

        tx = await contract.randomlySelectWinners(id, numberOfWinners)
        // tx.wait()
        return tx;
    } catch (error) {
        reportError(error)
    }
}

const getLottery = async (id: number) => {
    // const contract = await getEthereumContract()
    const contract = await getReadOnlyContract()
    const lottery = await contract.getLottery(id)
    return structureLotteries([lottery])[0]
}

const getLuckyNumbers = async (id: number) => {
    const contract = await getReadOnlyContract()
    const luckyNumbers = await contract.getLotteryLuckyNumbers(id)
    return luckyNumbers
}

const getPurchasedNumbers = async (id: number) => {
    const contract = await getReadOnlyContract()
    const participants = await contract.getLotteryParticipants(id)
    return structuredNumbers(participants)
}

const getParticipants = async (id: number) => {
    const contract = await getReadOnlyContract()
    const participants = await contract.getLotteryParticipants(id)
    return structuredParticipants(participants)
}

const getLotteryResult = async (id: number) => {
    const contract = await getReadOnlyContract()
    const lotterResult = await contract.getLotteryResult(id)
    return structuredResult(lotterResult)
}

const getLotteries = async () => {
    const contract = await getReadOnlyContract()
    const lotteries = await contract.getLotteries()
    return structureLotteries(lotteries)
}

const getMyLotteries = async () => {
    const contract = await getReadOnlyContract()
    const wallet = useWalletStore.getState().wallet
    const lotteries = await contract.getMyLotteries({ from: wallet })
    useLotteryStore.getState().setMyLotteries(structureLotteries(lotteries))
}

const structureLotteries = (lotteries: any) =>
    lotteries.map((lottery: any) => ({
        id: Number(lottery.id),
        title: lottery.title,
        description: lottery.description,
        owner: lottery.owner.toLowerCase(),
        prize: fromWei(lottery.prize),
        ticketPrice: fromWei(lottery.ticketPrice),
        image: lottery.image,
        createdAt: formatDate(Number(lottery.createdAt)),
        drawsAt: formatDate(Number(lottery.expiresAt)),
        expiresAt: Number(lottery.expiresAt),
        winners: Number(lottery.winners),
        participants: Number(lottery.participants),
        drawn: lottery.drawn,
        hasLuckyNumbers: lottery.hasLuckyNumbers,
    }))

const structuredNumbers = (participants: any) => {
    const purchasedNumbers = []

    for (let i = 0; i < participants.length; i++) {
        const purchasedNumber = participants[i][1]
        purchasedNumbers.push(purchasedNumber)
    }

    return purchasedNumbers
}

const structuredParticipants = (participants: any) =>
    participants.map((participant: any) => ({
        account: participant[0].toLowerCase(),
        lotteryNumber: participant[1],
        paid: participant[2],
    }))

const structuredResult = (result: any) => {
    const LotteryResult = {
        id: Number(result[0]),
        completed: result.completed,
        paidout: result[2],
        timestamp: Number(result[3]),
        sharePerWinner: fromWei(result.sharePerWinner || 0),
        winners: [] as { account: string, ticket: string, paid: boolean }[],
        requestToChainlinkSent: result.requestToChainlinkSent || false,
    }
    for (let i = 0; i < result.winners.length; i++) {
        LotteryResult.winners.push({
            account: result.winners[i][0].toLowerCase(),
            ticket: result.winners[i][1],
            paid: result.winners[i][2],
        })
    }
    return LotteryResult
}


const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthsOfYear = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ]

    const dayOfWeek = daysOfWeek[date.getDay()]
    const monthOfYear = monthsOfYear[date.getMonth()]
    const dayOfMonth = date.getDate()
    const year = date.getFullYear()

    return `${dayOfWeek} ${monthOfYear} ${dayOfMonth}, ${year}`
}

export {
    connectWallet,
    disconnectWallet,
    changeWallet,
    checkWallet,
    createLottery,
    importLuckyNumbers,
    buyTicket,
    performDraw,
    getLotteries,
    getMyLotteries,
    getLottery,
    getLuckyNumbers,
    getPurchasedNumbers,
    getParticipants,
    getLotteryResult,
}