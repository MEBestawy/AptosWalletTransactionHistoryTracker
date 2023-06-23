import fetch from 'node-fetch';

// ideally this would be synced with the DB service (perhaps using a shared library)
export interface Transaction {
    hash: string;
    version: string;
    senderAddress: string;
    timestamp: string;
}

// helper to process raw transactions data from Aptos API
const processRawTransactionsData = (rawTransactionsData: any): Transaction[] => {
    return rawTransactionsData
        .filter((transaction: any) => transaction.type === 'user_transaction')
        .map((userTransaction: any) => {
            return {
                hash: userTransaction.hash,
                version: userTransaction.version,
                senderAddress: userTransaction.sender,
                timestamp: userTransaction.timestamp,
            }
        });
};

export const fetchWalletTransactionsDataFromAptosApi = async (walletAddress: string) => {
    /* 
    TODO: Use more endpoints & GQL to fetch more metadata
    */
    const { status, data: rawTransactionsData } = await fetch(
        `${process.env.APTOS_NODE_API_ENDPOINT}/v1/accounts/${walletAddress}/transactions`
    ).then(async res => { return { status: res.status, data: await res.json()}});

    if (status !== 200) {
        return { error: 'Could not fetch wallet data from Aptos API' };
    }

    const processedTransactionsData = processRawTransactionsData(rawTransactionsData);
    return {transactions: processedTransactionsData};
};

export const fetchTransactionsDataFromAptosApiHandler = async (res: any, 
                                                   walletAddress: string): 
                                                   Promise<{error?: string;
                                                            transactions?: Transaction[]}> => {
    if (!walletAddress) {
        res.status(400).send('Missing wallet address');
        return { error: 'Missing wallet address' };
    }

    const {error, transactions} = await fetchWalletTransactionsDataFromAptosApi(walletAddress);
    if (error) {
        res.json({error});
        return { error };
    } else if (!transactions) {
        res.json({error: 'No transactions found'});
        return { error: 'No transactions found' };
    }

    res.json({transactions : transactions as Transaction[]});
    return { transactions: transactions as Transaction[] };
}

export const updateWalletDataInDB = async (walletAddress: string, transactions: Transaction[]) => {
    // create wallet if it doesn't exist
    await fetch(`${process.env.DB_SERVICE_API_ENDPOINT}/createWallets/`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "addresses": [walletAddress] })
    }).then(async res => await res.json());

    // create transactions
    await fetch(`${process.env.DB_SERVICE_API_ENDPOINT}/createTransactions/`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "targetWalletAddress": walletAddress, "transactions": transactions }),
    }).then(async res => await res.json());
};