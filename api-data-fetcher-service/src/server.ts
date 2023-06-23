import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {Transaction, fetchWalletTransactionsDataFromAptosApi, updateWalletDataInDB, fetchTransactionsDataFromAptosApiHandler} from './utils';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));


app.get('/wallet', async (req, res) => {
    const walletAddress = req.query.address as string || '';
    if (!walletAddress) {
        return res.status(400).send('Missing wallet address');
    }

    const storedWalletData = await fetch(
        `${process.env.DB_SERVICE_API_ENDPOINT}/wallet?address=${walletAddress}`
    ).then(async resp =>  await resp.json());

    if (Object.keys(storedWalletData).length == 0 || Number(storedWalletData.last_updated) == 0) {
        const {error, transactions} = await fetchWalletTransactionsDataFromAptosApi(walletAddress);
        if (error || !transactions) {
            res.json({error});
            return;
        }

        await updateWalletDataInDB(walletAddress, transactions);
        res.json({transactions});
        return;
    }

    // get transactions from DB
    const storedTransactions = await fetch(
        `${process.env.DB_SERVICE_API_ENDPOINT}/transactions?address=${walletAddress}`
    ).then(resp => resp.json()) as Transaction[];
    res.json({"transactions": storedTransactions});
});

app.get('/transactions', async (req, res) => {
    const walletAddress = req.query.address as string || '';
    return await fetchTransactionsDataFromAptosApiHandler(res, walletAddress);
});

app.post('/transactions', async (req, res) => {
    const walletAddress = req.body.address as string || '';
    const {error, transactions=[]} = await fetchTransactionsDataFromAptosApiHandler(res, walletAddress);
    if (error)
        return;

    await updateWalletDataInDB(walletAddress, transactions);
});

app.listen(8080, () => {
    console.log('Server is listening on port 8080');
});

