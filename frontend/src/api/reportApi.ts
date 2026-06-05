import apiClient from './index';

export const reportApi = {
  getCategoryBreakdown(type: 'income' | 'expense') {
    return apiClient.get('/reports/category-breakdown', { params: { type } });
  },

  getMonthlyTrend() {
    return apiClient.get('/reports/monthly-trend');
  },

  exportCsv() {
    // Download file
    return apiClient.get('/reports/export', { responseType: 'blob' });
  },
};
export default reportApi;
