import apiClient from './index';

export interface TransactionFilters {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionApi = {
  getTransactions(filters: TransactionFilters = {}) {
    return apiClient.get('/transactions', { params: filters });
  },

  getTransactionById(id: number) {
    return apiClient.get(`/transactions/${id}`);
  },

  createTransaction(data: { description: string; amount: number; type: 'income' | 'expense'; category: string; date: string }) {
    return apiClient.post('/transactions', data);
  },

  updateTransaction(id: number, data: { description: string; amount: number; type: 'income' | 'expense'; category: string; date: string }) {
    return apiClient.put(`/transactions/${id}`, data);
  },

  deleteTransaction(id: number) {
    return apiClient.delete(`/transactions/${id}`);
  },

  getSummary() {
    return apiClient.get('/transactions/summary');
  },

  adminGetAllTransactions() {
    return apiClient.get('/transactions/admin/all');
  },
};
export default transactionApi;
