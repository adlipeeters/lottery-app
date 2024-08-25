"use client"
import React, { useEffect } from 'react'
import { checkWallet } from '@/services/blockchain'

const Providers = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        checkWallet()
    }, [])
    return (
        <>
            {/* <ThemeProvider attribute='class' defaultTheme='dark' enableSystem> */}
            {children}
            {/* </ThemeProvider> */}
        </>
    )
}

export default Providers