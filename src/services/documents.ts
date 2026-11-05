import axios from 'axios';
import AbstractAPIService from './base/AbstractAPIService';
import APIClientBase from '@/api/clients/base';
import { DocumentConfirm, DocumentRecord, UploadUrlRequest, UploadUrlResponse } from '@/types/vehicle';

const DOCUMENTS = '/management/documents';

export type UploadDocumentOptions = {
  entityType: UploadUrlRequest['entity_type'];
  entityId: string;
  documentType: string;
  expiryDate?: string | null;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

/**
 * Two-step presigned upload: request URL -> PUT the binary straight to storage -> confirm the record.
 * Used through the browser (`SingletonAPIClient`).
 */
export default class DocumentService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async requestUploadUrl(data: UploadUrlRequest): Promise<UploadUrlResponse> {
    return (await this.client.post<UploadUrlResponse>(`${DOCUMENTS}/upload-url`, data)).data;
  }

  /**
   * PUT the binary to the presigned storage URL. It deliberately uses a bare axios call instead of the API client:
   * the client adds the JSON `Content-Type`, credentials and CSRF headers, which the storage origin rejects.
   */
  async uploadToStorage(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      withCredentials: false,
      signal,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  }

  async confirm(data: DocumentConfirm): Promise<DocumentRecord> {
    return (await this.client.post<DocumentRecord>(DOCUMENTS, data)).data;
  }

  async get(id: number): Promise<DocumentRecord> {
    return (await this.client.get<DocumentRecord>(`${DOCUMENTS}/${id}`)).data;
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`${DOCUMENTS}/${id}`);
  }

  async upload(file: File, options: UploadDocumentOptions): Promise<DocumentRecord> {
    const { entityType, entityId, documentType, expiryDate, onProgress, signal } = options;

    const { upload_url, key } = await this.requestUploadUrl({
      filename: file.name,
      content_type: file.type,
      entity_type: entityType,
      entity_id: entityId,
    });

    await this.uploadToStorage(upload_url, file, onProgress, signal);

    return this.confirm({
      key,
      type: documentType,
      entity_type: entityType,
      entity_id: entityId,
      expiry_date: expiryDate ?? null,
    });
  }
}
