import { Client } from 'bitpay-sdk';
import { Environment } from 'bitpay-sdk/dist/Environment';
import { TokenContainer } from 'bitpay-sdk/dist/TokenContainer';

const tokenContainer = new TokenContainer();
tokenContainer.addMerchant(process.env.BITPAY_MERCHANT_ID!);

export const bitpayClient = Client.createClientByPrivateKey(
  process.env.BITPAY_PRIVATE_KEY!,
  tokenContainer,
  process.env.PAYMENT_STATUS === 'LIVE' ? Environment.Prod : Environment.Test
);
