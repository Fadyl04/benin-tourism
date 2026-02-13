import pkg from 'fedapay';
import fedapayConfig from './fedapay.config.js';

const { FedaPay, Transaction } = pkg;

FedaPay.setApiKey(fedapayConfig.secretKey);
FedaPay.setEnvironment(fedapayConfig.environment); // 'sandbox' ou 'live'

export { FedaPay, Transaction };