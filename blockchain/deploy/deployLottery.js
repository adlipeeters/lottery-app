import { config } from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs-extra';

// Destructure the necessary functions from the default import
const { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } = fs;

// Load environment variables
config();

const { RPC_URL, PRIVATE_KEY, OWNER_ADDRESS, CHAINLINK_SUBSCRIPTION_ID } = process.env;
// console.log(CHAINLINK_SUBSCRIPTION_ID);
// process.exit(0);

// Contract details
const CONTRACT_NAME = "Lottery";
const OWNER = OWNER_ADDRESS;
const SERVICE_PERCENT = 5;
// const CHAINLINK_SUBSCRIPTION_ID = process.env.CHAINLINK_SUBSCRIPTION_ID;

// const COPY_TO_PATH = "../frontend/contracts";
// const COPY_TO_PATH = "../backend/contracts";
const COPY_TO_PATHS = ["../frontend/contracts", "../backend/contracts"];


async function main() {
    // Set up provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Read the contract ABI and bytecode
    const contractPath = `./out/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`;
    const contractJson = JSON.parse(readFileSync(contractPath, 'utf8'));
    const contractAbi = contractJson.abi;
    const contractBytecode = contractJson.bytecode;

    // Create a ContractFactory
    const contractFactory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);

    // Deploy the contract
    console.log("Deploying contract...");
    // const contract = await contractFactory.deploy(OWNER, SERVICE_PERCENT, CHAINLINK_SUBSCRIPTION_ID);
    const contract = await contractFactory.deploy(SERVICE_PERCENT, CHAINLINK_SUBSCRIPTION_ID);
    await contract.deployed();
    console.log(`Deployed contract address: ${contract.address}`);

    // Save the contract address to a file
    const contractAddressData = { contract_address: contract.address };
    writeFileSync('deployed_contract_address.json', JSON.stringify(contractAddressData, null, 2));

    // Save the full output to a file
    const deploymentOutput = {
        address: contract.address,
        transactionHash: contract.deployTransaction.hash
    };
    writeFileSync('logs/deployment_output.txt', JSON.stringify(deploymentOutput, null, 2));

    // Copy the contract address to the frontend

    for (const COPY_TO_PATH of COPY_TO_PATHS) {
        const contractCopyToPath = `${COPY_TO_PATH}/${CONTRACT_NAME}`;
        if (!existsSync(contractCopyToPath)) {
            mkdirSync(contractCopyToPath, { recursive: true });
        }
        copyFileSync('deployed_contract_address.json', `${contractCopyToPath}/${CONTRACT_NAME}_Address.json`);

        // Copy the ABI to the frontend
        copyFileSync(contractPath, `${contractCopyToPath}/${CONTRACT_NAME}_Abi.json`);

        // Create a dummy lottery
    }
    await createDummyLottery(contract, wallet, provider);
}

async function createDummyLottery(contract, wallet, provider) {
    const title = "Test Lottery";
    const description = "This is a test lottery";
    const image = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/768px-Ethereum-icon-purple.svg.png";
    const prize = ethers.utils.parseEther("1.0");
    const ticketPrice = ethers.utils.parseEther("0.01");

    // Set the expiry date to 10 hours from now
    let date = new Date();
    date.setHours(date.getHours() + 3);
    let expiresAt = date.getTime();

    try {
        // Create the lottery with the specified details
        const tx = await contract.createLottery(title, description, image, prize, ticketPrice, expiresAt);
        await tx.wait(); // Wait for the transaction to be mined
        console.log("Dummy lottery created!");
    } catch (error) {
        console.error("Error creating dummy lottery:", error);
        if (error.data) {
            console.error(`Error data: ${error.data}`);
        }
    }
}



main().catch((error) => {
    console.error(error);
    process.exit(1);
});
