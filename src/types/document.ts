export type DocumentExpiryStatus = 'valid' | 'expiring_soon' | 'expired';

/** A stored document as embedded in the car / driver / guarantor detail responses. */
export type ApiDocument = {
  id: number;
  type: string;
  category: string;
  expiryDate?: string | null;
  url: string;
  expiryStatus?: DocumentExpiryStatus | null;
};

export type ActionSuccess = { message: string };

export type DocumentEntityType = 'car' | 'driver' | 'guarantor' | 'garage';
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
