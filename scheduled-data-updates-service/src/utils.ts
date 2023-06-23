import fetch from 'node-fetch';

export const updateTransactionsData = async () => {
    const response = (await fetch(
        `${process.env.DB_SERVICE_API_ENDPOINT}/wallets`
    ).then(async res => await res.json()));
    const fetchedWallets = response.wallets || [];

    await fetchedWallets.forEach(async (wallet: any) => {
        await fetch(
            `${process.env.API_DATA_FETCHER_SERVICE_API_ENDPOINT}/transactions?address=${wallet.address}`,
            { 
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "address": wallet.address })
            }
        ).then(async res => await res.json());
    });
};