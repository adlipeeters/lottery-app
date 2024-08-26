export interface TruncateParams {
    text: string
    startChars: number
    endChars: number
    maxLength: number
}

export interface CreateLottery {
    title: string
    description: string
    imageUrl: string
    // prize: number
    ticketPrice: number
    expiresAt: number
}

export interface Lottery {
    id: number;
    title: string;
    description: string;
    owner: string;
    image: string;
    prize: number;
    ticketPrice: number;
    winners: number;
    participants: number;
    drawn: boolean;
    createdAt: string;
    drawsAt: string;
    expiresAt: number;
    hasLuckyNumbers: boolean;
    [key: string]: string | number | boolean;
}

export interface Participant {
    account: string
    lotteryNumber: string
    paid: boolean
}

export interface LotteryResult {
    id: number
    completed: boolean
    paidout: boolean
    timestamp: number
    sharePerWinner: string
    winners: Winner[]
    requestToChainlinkSent: boolean
}

export interface Winner {
    account: string,
    ticket: string,
    paid: boolean
}