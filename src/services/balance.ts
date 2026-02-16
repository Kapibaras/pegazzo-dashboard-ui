import AbstractAPIService from './base/AbstractAPIService';
import APIClientBase from '@/api/clients/base';
import { BalanceMetricsSimple } from '@/types/balance';

export default class BalanceService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async getSimpleMetrics(params?: { month?: number; year?: number }): Promise<BalanceMetricsSimple> {
    return (await this.client.get('/management/balance/metrics/simple', { params })).data;
  }
}
