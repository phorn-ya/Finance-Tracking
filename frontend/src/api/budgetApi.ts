import apiClient from './index';

export const budgetApi = {
  getBudgets() {
    return apiClient.get('/budgets');
  },

  setBudget(category: string, limit: number) {
    return apiClient.post('/budgets', { category, limit });
  },

  deleteBudget(category: string) {
    return apiClient.delete(`/budgets/${category}`);
  },

  getBudgetStatus(month?: string) {
    return apiClient.get('/budgets/status', { params: { month } });
  },
};
export default budgetApi;
