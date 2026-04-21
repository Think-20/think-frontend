export enum ETransactionStatus {
  pending = 1,
  confirmed = 2,
  reconciled = 3
}

export const transactionStatuses = new Map<ETransactionStatus, string>([
  [ETransactionStatus.pending, "Pendente"],
  [ETransactionStatus.confirmed, "Confirmado"],
  [ETransactionStatus.reconciled, "Conciliado"]
]);