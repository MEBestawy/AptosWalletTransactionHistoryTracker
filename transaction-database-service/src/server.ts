import express from 'express';
import { PrismaClient, Transaction, Wallet } from '@prisma/client';
import bodyParser from 'body-parser';
import { fetchWalletByAddress, updateWalletDate } from './utils';

export const prisma = new PrismaClient();

const app = express();
app.use(bodyParser.json());


app.get('/wallet', async (req, res) => {
    const address: string = req.query.address as string || "";
    const fetchedWallet = (await fetchWalletByAddress(address)) || {};
    res.json(fetchedWallet);
});

app.get("/wallets", async (req, res) => {
    const fetchedWallets: Wallet[] = await prisma.wallet.findMany() || [];
    res.json({ "wallets": fetchedWallets});
});

app.get('/transactions', async (req, res) => {
    const address: string = req.query.address as string || "";

    const fetchedWalletData = await fetchWalletByAddress(address);
    if (!fetchedWalletData) {
        res.status(404).json({ error: "Wallet not found" });
        return;
    }

    const fetchedTransactions = await prisma.transaction.findMany({
        where: { senderAddress: address },
    });
    res.json(fetchedTransactions);
});

app.post('/createWallets', async (req, res) => {
    const addresses = req.body.addresses as string[] || [];

    const existingAddresses = (await prisma.wallet.findMany({
        where: {
            address: { in: addresses }
        }
    })).map(wallet => wallet.address);

    const newAddresses = addresses.filter(address => !existingAddresses.includes(address));
    const result = await prisma.wallet.createMany({
        data: newAddresses.map(address => ({
            address,
            last_updated: '0',
        }))
    });
    res.json({
        createdWallets: result.count,
    });
});

app.post('/createTransactions', async (req, res) => {
    const transactions = req.body.transactions as Transaction[] || [];
    const targetWalletAddress = req.body.targetWalletAddress as string || "";

    if (!transactions.length || !targetWalletAddress.length) {
        res.status(400).json({ error: "Invalid request body" });
        return;
    }
    
    const existingTransactionHashes = (await prisma.transaction.findMany({
        where: {
            hash : { in: transactions.map(transaction => transaction.hash) }
        }
    })).map(transaction => transaction.hash);

    const newTransactions = transactions.filter(
        transaction => !existingTransactionHashes.includes(transaction.hash)
    );
    const result = await prisma.transaction.createMany({
        data: newTransactions,
    });

    if (result.count) {
        await updateWalletDate(targetWalletAddress);
    }

    res.json({
        createdTransactions: result.count,
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});