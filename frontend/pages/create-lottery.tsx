"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { createLottery } from "@/services/blockchain"
import { useRouter } from "next/navigation"

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useWalletStore from "@/store/wallet"

const FormSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(2, {
        message: "Description must be at least 2 characters.",
    }),
    imageUrl: z.string().url({
        message: "Invalid URL.",
    }),
    prize: z.preprocess((val) => parseFloat(val as string), z.number().min(0.1, {
        message: "Prize must be at least 0.1.",
    })),
    ticketPrice: z.preprocess((val) => parseFloat(val as string), z.number().min(0.05, {
        message: "Ticket price must be at least 0.05.",
    })),
    expiresAt: z.date().nullable().refine((date) => date !== null, {
        message: "Please select a date."
    }),
})

const CreateLottery = () => {
    const { wallet } = useWalletStore();
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Ethereum-ETH-icon.png",
            prize: 0,
            ticketPrice: 0,
            expiresAt: new Date(),
        },
    })

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setIsLoading(true)
        try {
            await createLottery({
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                prize: data.prize,
                ticketPrice: data.ticketPrice,
                expiresAt: data.expiresAt.getTime(),
            })
            router.push("/my-lotteries");
        } catch (error) {

        }
        finally {
            setIsLoading(false)
        }
    }

    if (!wallet) {
        return (
            <DashboardLayout>
                <Card x-chunk="dashboard-04-chunk-1">
                    <CardHeader>
                        <CardTitle>Create your lottery</CardTitle>
                        <CardDescription>
                            Create a lottery to earn money.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-2/3 space-y-6">
                            <div className="text-lg">
                                Please connect your wallet to create a lottery.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                    <CardTitle>Create your lottery</CardTitle>
                    <CardDescription>
                        Create a lottery to earn money.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Lottery #1" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {/* This is your public display name. */}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter a description for your lottery." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {/* This is your public display name. */}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://testnet.com/img.jpg" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {/* This is your public display name. */}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="prize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prize</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {/* This is your public display name. */}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ticketPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ticket Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.75"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {/* This is your public display name. */}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expiresAt"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-1">Expires At</FormLabel>
                                        <ReactDatePicker
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            selected={field.value}
                                            onChange={field.onChange}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            placeholderText="Select date and time"
                                        />
                                        <FormDescription>
                                            Set the expiration date and time for the lottery.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {isLoading ?
                                (
                                    <Button disabled>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </Button>
                                ) : (
                                    <Button type="submit">Create</Button>
                                )
                            }
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </DashboardLayout>
    )
}

export default CreateLottery;
