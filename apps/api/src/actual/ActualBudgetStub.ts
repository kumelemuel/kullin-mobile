import type { ActualBudgetPort } from './ActualBudgetPort.js';

export class ActualBudgetNotImplementedError extends Error {
  constructor(method: string) {
    super(`ActualBudgetPort.${method} is not implemented (stub adapter)`);
    this.name = 'ActualBudgetNotImplementedError';
  }
}

export function createActualBudgetStub(): ActualBudgetPort {
  const notImplemented = (method: string) => (): never => {
    throw new ActualBudgetNotImplementedError(method);
  };

  return {
    synchronize: notImplemented('synchronize'),
    listAccounts: notImplemented('listAccounts'),
    listCategories: notImplemented('listCategories'),
    listTransactions: notImplemented('listTransactions'),
    createTransaction: notImplemented('createTransaction'),
    updateTransaction: notImplemented('updateTransaction'),
    deleteTransaction: notImplemented('deleteTransaction'),
  };
}
