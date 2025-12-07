export type TransactionHistoryEntry = {
  type:
    | 'ChangeStage'
    | 'AddListingAgent'
    | 'AddSellingAgent'
    | 'CommissionCalculation'
    | 'Update';
  payload?: Record<string, unknown>;
  createdAt?: Date;
};
