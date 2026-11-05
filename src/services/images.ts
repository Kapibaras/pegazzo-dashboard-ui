import axios from 'axios';
import AbstractAPIService from './base/AbstractAPIService';
import APIClientBase from '@/api/clients/base';
import { ImageEntityType, ImageUploadUrlRequest, ImageUploadUrlResponse } from '@/types/document';

const IMAGES = '/management/images';

export default class ImageService extends AbstractAPIService {
  constructor(client: APIClientBase) {
    super(client);
  }

  async requestUploadUrl(data: ImageUploadUrlRequest): Promise<ImageUploadUrlResponse> {
    return (await this.client.post<ImageUploadUrlResponse>(`${IMAGES}/upload-url`, data)).data;
  }

  /** Bare axios PUT to the presigned URL (see `DocumentService.uploadToStorage`). */
  async uploadToStorage(uploadUrl: string, file: File, signal?: AbortSignal): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      withCredentials: false,
      signal,
    });
  }

  /** Uploads the binary and returns the public URL that must then be attached to the car. */
  async upload(
    file: File,
    entityType: ImageEntityType,
    entityId: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const { upload_url, public_url } = await this.requestUploadUrl({
      filename: file.name,
      content_type: file.type,
      entity_type: entityType,
      entity_id: entityId,
    });

    await this.uploadToStorage(upload_url, file, signal);
    return public_url;
  }

  /** Attaches an already uploaded public image as the driver photo (replaces the previous one). */
  async setDriverPhoto(driverId: string, url: string): Promise<void> {
    await this.client.patch(`${IMAGES}/drivers/${encodeURIComponent(driverId)}/photo`, { url });
  }

  async setCarAgencyImage(carId: string, url: string): Promise<void> {
    await this.client.patch(`${IMAGES}/cars/${encodeURIComponent(carId)}/agency-image`, { url });
  }

  async removeCarAgencyImage(carId: string): Promise<void> {
    await this.client.delete(`${IMAGES}/cars/${encodeURIComponent(carId)}/agency-image`);
  }

  async addCarPhoto(carId: string, url: string): Promise<void> {
    await this.client.post(`${IMAGES}/cars/${encodeURIComponent(carId)}/photos`, { url });
  }

  async removeCarPhoto(carId: string, url: string): Promise<void> {
    await this.client.delete(`${IMAGES}/cars/${encodeURIComponent(carId)}/photos`, { data: { url } });
  }
}
