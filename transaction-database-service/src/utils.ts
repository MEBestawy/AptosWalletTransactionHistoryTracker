import { prisma } from './server';

export const fetchWalletByAddress = async (address: string) => {
    return await prisma.wallet.findFirst({
        where: {
            address,
        }
    });
}

export const updateWalletDate = async (targetWalletAddress: string, new_date_time: number = Date.now()) => {
    await prisma.wallet.update({
        where: {
            address: targetWalletAddress,
        },
        data: {
            last_updated: new_date_time.toString(),
        }
    });
}