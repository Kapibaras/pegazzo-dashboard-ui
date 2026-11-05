'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SingletonAPIClient } from '@/api';
import { normalizeApiError } from '@/helpers/apiError';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import VehicleService from '@/services/vehicle';
import { Associate, Insurance, VehicleModelGroup } from '@/types/vehicle';

/** Small catalogs used by the wizard comboboxes. They are loaded once and filtered client-side. */
const useVehicleCatalogs = () => {
  const { handleApiError } = useApiErrorHandler();
  const service = useMemo(() => new VehicleService(SingletonAPIClient.getInstance()), []);

  const [models, setModels] = useState<VehicleModelGroup[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [modelGroups, insuranceList, associateList] = await Promise.all([
        service.getModels(),
        service.getInsurances(),
        service.getAssociates(),
      ]);
      setModels(modelGroups ?? []);
      setInsurances(insuranceList ?? []);
      setAssociates(associateList ?? []);
    } catch (error) {
      await handleApiError(normalizeApiError(error), ['common', 'vehicles']);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  useEffect(() => {
    void load();
  }, [load]);

  const addModel = useCallback((make: string, model: { id: number; model: string; abbreviation: string }) => {
    setModels((prev) => {
      const exists = prev.some((group) => group.make.toLowerCase() === make.toLowerCase());
      if (!exists) return [...prev, { make, models: [model] }].sort((a, b) => a.make.localeCompare(b.make));
      return prev.map((group) =>
        group.make.toLowerCase() === make.toLowerCase() ? { ...group, models: [...group.models, model] } : group,
      );
    });
  }, []);

  const addInsurance = useCallback((insurance: Insurance) => setInsurances((prev) => [...prev, insurance]), []);
  const addAssociate = useCallback((associate: Associate) => setAssociates((prev) => [...prev, associate]), []);

  return { models, insurances, associates, isLoading, addModel, addInsurance, addAssociate, reload: load };
};

export default useVehicleCatalogs;
