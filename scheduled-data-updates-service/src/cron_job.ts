import dotenv from 'dotenv';
import cron from 'node-cron';
import { updateTransactionsData } from './utils';

dotenv.config();

cron.schedule('0 */4 * * *', updateTransactionsData);