import AbstractAPIService from './base/AbstractAPIService';
import APIClientBase from '@/api/clients/base';
import {
  ActionSuccess,
  Associate,
  AssociateCreate,
  AssociateDetail,
  AssociateUpdate,
  Insurance,
  InsuranceCreate,
  InsuranceUpdate,
  VehicleCreate,
  VehicleDetail,
  VehicleFolioRequest,
  VehicleModel,
  VehicleModelCreate,
  VehicleModelGroup,
  VehicleStatus,
  VehicleSummary,
  VehicleUpdate,
  VehiclesParams,
  VehiclesResponse,
} from '@/types/vehicle';

const CARS = '/management/cars';

export default class VehicleService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async getVehicles(params: VehiclesParams, signal?: AbortSignal): Promise<VehiclesResponse> {
    return (await this.client.get<VehiclesResponse>(CARS, { params, signal })).data;
  }

  async getVehicle(id: string): Promise<VehicleDetail> {
    return (await this.client.get<VehicleDetail>(`${CARS}/${encodeURIComponent(id)}`)).data;
  }

  async createVehicle(data: VehicleCreate): Promise<VehicleSummary> {
    return (await this.client.post<VehicleSummary>(CARS, data)).data;
  }

  async updateVehicle(id: string, data: VehicleUpdate): Promise<VehicleSummary> {
    return (await this.client.patch<VehicleSummary>(`${CARS}/${encodeURIComponent(id)}`, data)).data;
  }

  async updateStatus(id: string, status: VehicleStatus): Promise<VehicleSummary> {
    return (await this.client.patch<VehicleSummary>(`${CARS}/${encodeURIComponent(id)}/status`, { status })).data;
  }

  async archiveVehicle(id: string): Promise<VehicleSummary> {
    return (await this.client.patch<VehicleSummary>(`${CARS}/${encodeURIComponent(id)}/archive`)).data;
  }

  async unarchiveVehicle(id: string): Promise<VehicleSummary> {
    return (await this.client.patch<VehicleSummary>(`${CARS}/${encodeURIComponent(id)}/unarchive`)).data;
  }

  async deleteVehicle(id: string): Promise<ActionSuccess> {
    return (await this.client.delete<ActionSuccess>(`${CARS}/${encodeURIComponent(id)}`)).data;
  }

  async computeFolio(data: VehicleFolioRequest): Promise<{ folio: string }> {
    return (await this.client.post<{ folio: string }>(`${CARS}/folio`, data)).data;
  }

  async getModels(): Promise<VehicleModelGroup[]> {
    return (await this.client.get<VehicleModelGroup[]>(`${CARS}/models`)).data;
  }

  async createModel(data: VehicleModelCreate): Promise<VehicleModel> {
    return (await this.client.post<VehicleModel>(`${CARS}/models`, data)).data;
  }

  async deleteModel(id: number): Promise<void> {
    await this.client.delete(`${CARS}/models/${id}`);
  }

  async getInsurances(search?: string): Promise<Insurance[]> {
    return (await this.client.get<Insurance[]>(`${CARS}/insurance`, { params: search ? { search } : {} })).data;
  }

  async createInsurance(data: InsuranceCreate): Promise<Insurance> {
    return (await this.client.post<Insurance>(`${CARS}/insurance`, data)).data;
  }

  async updateInsurance(id: number, data: InsuranceUpdate): Promise<Insurance> {
    return (await this.client.patch<Insurance>(`${CARS}/insurance/${id}`, data)).data;
  }

  async deleteInsurance(id: number): Promise<ActionSuccess> {
    return (await this.client.delete<ActionSuccess>(`${CARS}/insurance/${id}`)).data;
  }

  async getAssociates(search?: string): Promise<Associate[]> {
    return (await this.client.get<Associate[]>(`${CARS}/associate`, { params: search ? { search } : {} })).data;
  }

  async getAssociate(id: number): Promise<AssociateDetail> {
    return (await this.client.get<AssociateDetail>(`${CARS}/associate/${id}`)).data;
  }

  async updateAssociate(id: number, data: AssociateUpdate): Promise<Associate> {
    return (await this.client.patch<Associate>(`${CARS}/associate/${id}`, data)).data;
  }

  async deleteAssociate(id: number): Promise<ActionSuccess> {
    return (await this.client.delete<ActionSuccess>(`${CARS}/associate/${id}`)).data;
  }

  async createAssociate(data: AssociateCreate): Promise<Associate> {
    return (await this.client.post<Associate>(`${CARS}/associate`, data)).data;
  }
}
