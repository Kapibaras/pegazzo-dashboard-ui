import { PaginationMeta, SortOrder } from './transaction';

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'IN_MAINTENANCE';
export type VehicleSortBy = 'make' | 'plate' | 'status' | 'year' | 'created_at';
export type DocumentExpiryStatus = 'valid' | 'expiring_soon' | 'expired';

export type VehicleSummary = {
  id: string;
  make: string;
  model: string;
  plate: string;
  status: VehicleStatus;
  year: string;
  color: string;
  agencyImage?: string | null;
};

export type VehiclesResponse = {
  cars: VehicleSummary[];
  pagination: PaginationMeta;
};

export type VehiclesParams = {
  page?: number;
  limit?: number;
  status?: VehicleStatus;
  search?: string;
  year?: string;
  archived?: boolean;
  sortBy?: VehicleSortBy;
  sortOrder?: SortOrder;
};

export type VehicleInsurance = {
  id: number;
  name: string;
  policyNumber: string;
  policyExpirationDate: string;
  policyType: string;
};

export type VehicleAssociate = {
  id: number;
  name: string;
  surnames: string;
  telephones: string[];
};

export type VehicleDocument = {
  id: number;
  type: string;
  category: string;
  expiryDate?: string | null;
  url: string;
  expiryStatus?: DocumentExpiryStatus | null;
};

export type AssignedDriver = {
  id: string;
  name: string;
  surnames: string;
};

type VehicleBase = {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  status: VehicleStatus;
  vin: string;
  plate: string;
  bodyType: string;
  engineType: string;
  transmission: string;
  engineSerialNumber: string;
  odometer: number;
  doorsNumber: number;
  passengersNumber: number;
  tireSpecification: string;
  unitValue: number;
  unitBillingValue: number;
  billNumber: string;
  publicVehicleRegistry: string;
  altaPublicVehicleRegistry: string;
  batteryModel: string;
  batterySerialNumber: string;
  batteryDate: string;
  legalOwnerName: string;
  legalOwnerSurnames: string;
  isFinancedLiquidated: boolean;
  financingAgency?: string | null;
  financingPurchaseDate?: string | null;
  financingTermMonths?: number | null;
  financingRemainingAmount?: number | string | null;
  features?: unknown;
  details?: unknown;
  agencyImage?: string | null;
  photos?: string[] | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VehicleDetail = VehicleBase & {
  insurance: VehicleInsurance;
  associate?: VehicleAssociate | null;
  documents: VehicleDocument[];
  assignedDriver?: AssignedDriver | null;
};

/** Payload for POST /management/cars. There is no `status`: the backend creates every car as INACTIVE. */
export type VehicleCreate = {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  vin: string;
  plate: string;
  bodyType: string;
  engineType: string;
  transmission: string;
  engineSerialNumber: string;
  odometer: number;
  doorsNumber: number;
  passengersNumber: number;
  tireSpecification: string;
  unitValue: number;
  unitBillingValue: number;
  billNumber: string;
  publicVehicleRegistry: string;
  altaPublicVehicleRegistry: string;
  batteryModel: string;
  batterySerialNumber: string;
  batteryDate: string;
  legalOwnerName: string;
  legalOwnerSurnames: string;
  isFinancedLiquidated: boolean;
  financingAgency?: string | null;
  financingPurchaseDate?: string | null;
  financingTermMonths?: number | null;
  financingRemainingAmount?: number | null;
  features?: unknown;
  details?: unknown;
  insuranceProviderId: number;
  policyNumber: string;
  policyExpirationDate: string;
  policyType: string;
  associateId?: number | null;
};

/**
 * Payload for PATCH /management/cars/{id}. Every field optional; status has its own endpoint and images are managed
 * through /management/images (the PATCH rejects `agencyImage` and `photos`).
 */
export type VehicleUpdate = Partial<Omit<VehicleCreate, 'id'>>;

export type VehicleFolioRequest = {
  associateId: number;
  legalOwnerIsPegazzo: boolean;
  make: string;
  model: string;
  transmission: string;
};

export type VehicleModelItem = { id: number; model: string; abbreviation: string };
export type VehicleModelGroup = { make: string; models: VehicleModelItem[] };
export type VehicleModelCreate = { make: string; model: string; abbreviation: string };
export type VehicleModel = { id: number; make: string; model: string; abbreviation: string };

export type Insurance = {
  id: number;
  name: string;
  telephones?: string[] | null;
  /** Number of cars insured by this provider (a provider with cars cannot be deleted). */
  carCount?: number;
};
export type InsuranceCreate = { name: string; telephones?: string[] };
export type InsuranceUpdate = Partial<InsuranceCreate>;

export type Associate = {
  id: number;
  name: string;
  surnames: string;
  telephones?: string[] | null;
  /** Number of cars linked to the associate (listing and detail). */
  car_count?: number;
};
export type AssociateCreate = { name: string; surnames: string; telephones?: string[] };
export type AssociateUpdate = Partial<AssociateCreate>;
/** GET /management/cars/associate/{id}: the associate plus the cars linked to it. */
export type AssociateDetail = Associate & { cars: VehicleSummary[] };

export type ActionSuccess = { message: string };

export type DocumentEntityType = 'car' | 'driver' | 'guarantor';
export type ImageEntityType = 'car_agency_image' | 'car_photo' | 'driver_photo';

export type UploadUrlRequest = {
  filename: string;
  content_type: string;
  entity_type: DocumentEntityType;
  entity_id: string;
};
export type UploadUrlResponse = { upload_url: string; key: string; expires_in: number };

export type DocumentConfirm = {
  key: string;
  type: string;
  entity_type: DocumentEntityType;
  entity_id: string;
  expiry_date?: string | null;
};

export type DocumentRecord = {
  id: number;
  type: string;
  url: string;
  category: string;
  status: string;
  extracted_fields?: unknown;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type ImageUploadUrlRequest = {
  filename: string;
  content_type: string;
  entity_type: ImageEntityType;
  entity_id: string;
};
export type ImageUploadUrlResponse = { upload_url: string; key: string; public_url: string; expires_in: number };
