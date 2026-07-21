/**
 * Port isolating Actual Budget from the rest of the API.
 * Real @actual-app/api wiring is deferred; use the stub for now.
 */
export interface ActualBudgetPort {
  synchronize(): Promise<void>;
  listAccounts(): Promise<unknown[]>;
  listCategories(): Promise<unknown[]>;
  listTransactions(options?: { since?: string }): Promise<unknown[]>;
  createTransaction(input: unknown): Promise<unknown>;
  updateTransaction(id: string, input: unknown): Promise<unknown>;
  deleteTransaction(id: string): Promise<void>;
}
