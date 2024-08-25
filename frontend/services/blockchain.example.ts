import { ethers } from 'ethers'
import address from '@/contracts/Hello/Hello_Address.json'
import abi from '@/contracts/Hello/Hello_Abi.json'
import useWalletStore from '@/store/wallet';

const { setWallet } = useWalletStore.getState();
const ContractAddress = address.contract_address
const ContractAbi = abi.abi
let ethereum: any
let tx: any

if (typeof window !== 'undefined') {
    ethereum = (window as any).ethereum
}

const toWei = (num: any) => ethers.utils.parseEther(num.toString())
const fromWei = (num: any) => ethers.utils.formatEther(num)

const getEthereumContract = async () => {
    const accounts = await ethereum?.request?.({ method: 'eth_accounts' })
    const provider = accounts?.[0]
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(process.env.NEXT_APP_RPC_URL)
    const wallet = accounts?.[0] ? null : ethers.Wallet.createRandom()
    const signer = provider.getSigner(accounts?.[0] ? undefined : wallet?.address)

    const contract = new ethers.Contract(ContractAddress, ContractAbi, signer)
    return contract
}

const connectWallet = async () => {
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

        // Clear the wallet address
        setWallet('');

        // Optionally, you can also stop listening to events if you have any
        ethereum.removeAllListeners('accountsChanged');
        ethereum.removeAllListeners('chainChanged');

        console.log('Wallet disconnected');
    } catch (error) {
        reportError(error);
    }
}

const changeWallet = async () => {
    try {
        if (!ethereum) return reportError('Please install Metamask');

        // Prompt user to connect a new wallet
        const accounts = await ethereum.request?.({ method: 'eth_requestAccounts' });
        setWallet(accounts?.[0]);

        console.log('Wallet changed');
    } catch (error) {
        reportError(error);
    }
};

const checkWallet = async () => {
    try {
        if (!ethereum) return reportError('Please install Metamask')
        const accounts = await ethereum.request?.({ method: 'eth_accounts' })

        ethereum.on('chainChanged', () => {
            window.location.reload()
        })

        ethereum.on('accountsChanged', async () => {
            setWallet(accounts?.[0])
            await checkWallet()
        })

        if (accounts?.length) {
            setWallet(accounts[0])
        } else {
            setWallet('')
            reportError('Please connect wallet, no accounts found.')
        }
    } catch (error) {
        reportError(error)
    }
}

const helloFunction = async () => {
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const message = await contract.message();
        return message;
    } catch (error) {
        console.error("Error fetching Message:", error);
    }
}

const updateHelloFunction = async (message: string) => {
    try {
        if (!ethereum) return alert('Please install Metamask');
        const contract = await getEthereumContract();
        const tx = await contract.update(message);
        await tx.wait();

        contract.on("UpdatedMessages", (oldStr, newStr, updateCount) => {
            console.log(`Event received! Old Message: ${oldStr}, New Message: ${newStr}, Update Count: ${updateCount}`);
        });

        return true;
    } catch (error) {
        console.error("Error fetching Message:", error);
    }
}

export {
    connectWallet,
    disconnectWallet,
    changeWallet,
    checkWallet,
    helloFunction,
    updateHelloFunction
}