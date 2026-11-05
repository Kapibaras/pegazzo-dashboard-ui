import AbstractAPIService from './base/AbstractAPIService';
import APIClientBase from '@/api/clients/base';
import { ActionSuccess } from '@/types/document';
import {
  DriverCreate,
  DriverDetail,
  DriverRecord,
  DriversParams,
  DriversResponse,
  DriverStatus,
  DriverUpdate,
  GuarantorCreate,
  GuarantorRecord,
  GuarantorUpdate,
} from '@/types/driver';

const DRIVERS = '/management/drivers';

const driverPath = (id: string) => `${DRIVERS}/${encodeURIComponent(id)}`;

export default class DriverService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async getDrivers(params: DriversParams, signal?: AbortSignal): Promise<DriversResponse> {
    return (await this.client.get<DriversResponse>(DRIVERS, { params, signal })).data;
  }

  async getDriver(id: string): Promise<DriverDetail> {
    return (await this.client.get<DriverDetail>(driverPath(id))).data;
  }

  async createDriver(data: DriverCreate): Promise<DriverRecord> {
    return (await this.client.post<DriverRecord>(DRIVERS, data)).data;
  }

  async updateDriver(id: string, data: DriverUpdate): Promise<DriverRecord> {
    return (await this.client.patch<DriverRecord>(driverPath(id), data)).data;
  }

  async updateStatus(id: string, status: DriverStatus): Promise<DriverRecord> {
    return (await this.client.patch<DriverRecord>(`${driverPath(id)}/status`, { status })).data;
  }

  async archiveDriver(id: string): Promise<DriverRecord> {
    return (await this.client.patch<DriverRecord>(`${driverPath(id)}/archive`)).data;
  }

  async unarchiveDriver(id: string): Promise<DriverRecord> {
    return (await this.client.patch<DriverRecord>(`${driverPath(id)}/unarchive`)).data;
  }

  async deleteDriver(id: string): Promise<ActionSuccess> {
    return (await this.client.delete<ActionSuccess>(driverPath(id))).data;
  }

  async createGuarantor(driverId: string, data: GuarantorCreate): Promise<GuarantorRecord> {
    return (await this.client.post<GuarantorRecord>(`${driverPath(driverId)}/guarantors`, data)).data;
  }

  async updateGuarantor(driverId: string, guarantorId: number, data: GuarantorUpdate): Promise<GuarantorRecord> {
    return (await this.client.patch<GuarantorRecord>(`${driverPath(driverId)}/guarantors/${guarantorId}`, data)).data;
  }

  async removeGuarantor(driverId: string, guarantorId: number): Promise<void> {
    await this.client.delete(`${driverPath(driverId)}/guarantors/${guarantorId}`);
  }
}
