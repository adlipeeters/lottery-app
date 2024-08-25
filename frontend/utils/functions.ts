import { TruncateParams } from "@/types"

export const generateLuckyNumbers = (count: number) => {
    const result = []
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < count; i++) {
        let string = ''
        for (let j = 0; j < 6; j++) {
            string += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        result.push(string)
    }
    return result
}

export const truncate = ({ text, startChars, endChars, maxLength }: TruncateParams): string => {
    if (text.length > maxLength) {
        let start = text.substring(0, startChars)
        let end = text.substring(text.length - endChars, text.length)
        while (start.length + end.length < maxLength) {
            start = start + '.'
        }
        return start + end
    }
    return text
}