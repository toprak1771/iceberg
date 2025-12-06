export type TransactionHistoryEntry = {
  type:
    | 'ChangeStage'
    | 'AddListingAgent'
    | 'AddSellingAgent'
    | 'Payment'
    | 'Update';
  payload?: Record<string, unknown>;
  createdAt?: Date;
};
