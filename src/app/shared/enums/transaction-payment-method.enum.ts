export enum ETransactionPaymentMethod {
  money = 1,
  deposit = 2,
  pix = 3,
  creditCard = 4,
  bankSlip = 5
}

export const transactionPaymentMethods = new Map<ETransactionPaymentMethod, string>([
  [ETransactionPaymentMethod.bankSlip, "Boleto Bancário"],
  [ETransactionPaymentMethod.creditCard, "Cartão de Crédito"],
  [ETransactionPaymentMethod.deposit, "Depósito"],
  [ETransactionPaymentMethod.money, "Dinheiro"],
  [ETransactionPaymentMethod.pix, "Pix"]
]);
