enum PaymentMethods {
  VENMO = 'VENMO',
  ZELLE = 'ZELLE',
  BTC = 'BTC',
  ETH = 'ETH',
  LITECOIN = 'LITECOIN',
  USDC_ERC_20 = 'USDC_ERC_20',
  CARDANO_ON_ADA_NETWORK = 'CARDANO_ON_ADA_NETWORK',
  POLYGON = 'POLYGON',
  XRP = 'XRP',
  TETHER = 'TETHER',
  DOGECOIN = 'DOGECOIN',
}

export const paymentQRS: Record<
  PaymentMethods,
  { src: string; identifier: string }
> = {
  VENMO: {
    src: '/payment_qr/venmo.png',
    identifier: '@paynuer',
  },
  ZELLE: {
    src: '/payment_qr/zelle.png',
    identifier: 'payments@paynuer.com',
  },
  BTC: {
    src: '/payment_qr/btc.png',
    identifier: '3Jcp2gqvzaTCyd9wzC2kDFCB1s1o6tAbeq',
  },
  ETH: {
    src: '/payment_qr/eth.png',
    identifier: '0x7BFe522961bEe9AFF6F1F474E746af290aE1F681',
  },
  LITECOIN: {
    src: '/payment_qr/litecoin.png',
    identifier: 'MJ4cMbzYjsKGcwU554dn6D53LkB8tr4Kat',
  },
  USDC_ERC_20: {
    src: '/payment_qr/usdc_erc_20.png',
    identifier: '0xFDFE456D55D7e817D9953031ac8eC6DbB3F2E4a1',
  },
  CARDANO_ON_ADA_NETWORK: {
    src: '/payment_qr/cardano_on_ada_network.png',
    identifier: 'addr1v8ahntcdcxtur2lu7dq0s6vz5268qe6tyfe2vj8umdevtegjf6wsr',
  },
  POLYGON: {
    src: '/payment_qr/polygon.png',
    identifier: '0x6B91D5E707B29DC45eFe748eF33099D4293B78eD',
  },
  XRP: {
    src: '/payment_qr/xrp.png',
    identifier: 'rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg',
  },
  TETHER: {
    src: '/payment_qr/tether.png',
    identifier: '0x2e6740D49B3AaE44ca44Ed02b2dB7B822887E80e',
  },
  DOGECOIN: {
    src: '/payment_qr/dogecoin.png',
    identifier: 'DUKT1DKA96MsE8Qo5A33VyjQSkRhaAyAFN',
  },
};
