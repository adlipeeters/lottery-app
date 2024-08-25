import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { importLuckyNumbers } from "@/services/blockchain"
import { generateLuckyNumbers } from "@/utils/functions"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const ImportLuckyNumberDialog = (
    { id, open, setOpen, setLotteryImportId }: { id: number, open: boolean, setOpen: (open: boolean) => void, setLotteryImportId: (open: number) => void }
) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ticketNr, setTicketNr] = useState(0);

    const onSubmit = async () => {
        setIsLoading(true)
        const luckyNumbers = generateLuckyNumbers(ticketNr)
        try {
            await importLuckyNumbers(id, luckyNumbers)
            toast.success('Lucky numbers imported successfully')
        } catch (error) {

        }
        finally {
            setIsLoading(false)
            setOpen(false)
            setTicketNr(0)
            setLotteryImportId(0)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        {"Make changes to your profile here. Click save when you're done."}
                    </DialogDescription>
                </DialogHeader>
                <div className="">
                    <div className="flex flex-col">
                        <Label htmlFor="ticketNr" className="">
                            Number of tickets to generate
                        </Label>
                        <Input
                            name="ticketNr"
                            value={ticketNr}
                            onChange={(e) => setTicketNr(Number(e.target.value))}
                            id="number"
                            defaultValue="0"
                            className="mt-2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    {/* <Button onClick={onSubmit} type="submit">Import</Button> */}
                    {isLoading ?
                        (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        ) : (
                            <Button onClick={onSubmit} type="submit">Import</Button>
                        )
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ImportLuckyNumberDialog
