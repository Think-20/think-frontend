export enum ECreationStatus {
  backlog = 1,
  aFazer = 2,
  emAndamento = 3,
  impeditivo = 4,
  finalizado = 5,
}

export const creationStatusLabels = new Map<ECreationStatus, string>([
  [ECreationStatus.backlog, "Backlog"],
  [ECreationStatus.aFazer, "A fazer"],
  [ECreationStatus.emAndamento, "Em andamento"],
  [ECreationStatus.impeditivo, "Impeditivo"],
  [ECreationStatus.finalizado, "Finalizado"],
]);
