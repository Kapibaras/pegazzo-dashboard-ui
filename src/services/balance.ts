import AbstractAPIService from './base/AbstractAPIService';
import APIClientBase from '@/api/clients/base';
import {
  BalanceMetricsSimple,
  BalanceMetricsDetailed,
  BalanceMetricsParams,
  BalanceTrendResponse,
  BalanceTrendParams,
} from '@/types/balance';
import {
  Transaction,
  TransactionAuthorizationPayload,
  TransactionCount,
  TransactionCreate,
  TransactionPatch,
  TransactionsCountParams,
  TransactionsParams,
  TransactionsResponse,
} from '@/types/transaction';

export default class BalanceService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async getSimpleMetrics(params?: { month?: number; year?: number }): Promise<BalanceMetricsSimple> {
    return (await this.client.get<BalanceMetricsSimple>('/management/balance/metrics/simple', { params })).data;
  }

  async getDetailedMetrics(params: BalanceMetricsParams): Promise<BalanceMetricsDetailed> {
    return (await this.client.get<BalanceMetricsDetailed>('/management/balance/metrics', { params })).data;
  }

  async getTrendData(params: BalanceTrendParams): Promise<BalanceTrendResponse> {
    return (await this.client.get<BalanceTrendResponse>('/management/balance/metrics/trend', { params })).data;
  }

  async getTransactions(params: TransactionsParams): Promise<TransactionsResponse> {
    return (await this.client.get<TransactionsResponse>('/management/balance/transactions', { params })).data;
  }

  async createTransaction(data: TransactionCreate): Promise<Transaction> {
    return (await this.client.post<Transaction>('/management/balance/transaction', data)).data;
  }

  async getTransaction(reference: string): Promise<Transaction> {
    return (await this.client.get<Transaction>(`/management/balance/transaction/${reference}`)).data;
  }

  async updateTransaction(reference: string, data: TransactionPatch): Promise<Transaction> {
    return (await this.client.patch<Transaction>(`/management/balance/transaction/${reference}`, data)).data;
  }

  async deleteTransaction(reference: string): Promise<void> {
    await this.client.delete(`/management/balance/transaction/${reference}`);
  }

  async authorizeTransaction(reference: string, payload: TransactionAuthorizationPayload): Promise<Transaction> {
    return (await this.client.post<Transaction>(`/management/balance/transaction/${reference}/authorization`, payload)).data;
  }

  async getTransactionsCount(params?: TransactionsCountParams): Promise<TransactionCount> {
    return (await this.client.get<TransactionCount>('/management/balance/transactions/count', { params })).data;
  }
}
