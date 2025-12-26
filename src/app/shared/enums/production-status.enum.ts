export enum EProductionStatus {
  backlog = 1,
  aFazer = 2,
  emAndamento = 3,
  impeditivo = 4,
  finalizado = 5,
}

export const productionStatusLabels = new Map<EProductionStatus, string>([
  [EProductionStatus.backlog, "Backlog"],
  [EProductionStatus.aFazer, "A fazer"],
  [EProductionStatus.emAndamento, "Em andamento"],
  [EProductionStatus.impeditivo, "Impeditivo"],
  [EProductionStatus.finalizado, "Finalizado"],
]);
