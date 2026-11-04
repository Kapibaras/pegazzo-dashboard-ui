'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, ChevronRight, ShieldAlert } from 'lucide-react';
import { Resolver, useForm } from 'react-hook-form';
import { SingletonAPIClient } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useUser } from '@/contexts/UserProvider';
import findErrorMessage from '@/errors/findErrorMessage';
import { NETWORK_ERROR_MESSAGE, normalizeApiError } from '@/helpers/apiError';
import useVehicleCatalogs from '@/hooks/vehicles/useVehicleCatalogs';
import {
  buildVehicleSchema,
  DEFAULT_VEHICLE_FORM_VALUES,
  STEP_FIELDS,
  toCreatePayload,
  toUpdatePayload,
  vehicleToFormValues,
  VehicleFormValues,
  WizardStepId,
} from '@/lib/schemas/vehicleSchema';
import { Role } from '@/lib/schemas/userSchema';
import { getVehicleTitle } from '@/lib/vehicle';
import ImageService from '@/services/images';
import { ToastService } from '@/services/toast';
import VehicleService from '@/services/vehicle';
import { VehicleDetail, VehicleUpdate } from '@/types/vehicle';
import { createExistingImage, ImageItem } from '../ImageUpload';
import AdminStep from './AdminStep';
import AssociateStep from './AssociateStep';
import DocumentsStep from './DocumentsStep';
import IdentityStep from './IdentityStep';
import SaveProgressDialog, { SaveTaskView } from './SaveProgressDialog';
import SummaryStep, { FolioState } from './SummaryStep';
import TechnicalStep from './TechnicalStep';
import WizardStepper from './WizardStepper';

type VehicleWizardProps = { mode: 'create' } | { mode: 'edit'; vehicle: VehicleDetail };

type SaveTask = SaveTaskView & { run: () => Promise<void> };

const STEP_LABELS: Record<WizardStepId, string> = {
  identity: 'Identidad',
  technical: 'Técnico y batería',
  admin: 'Administrativo',
  associate: 'Socio',
  summary: 'Resumen',
  documents: 'Documentación',
};

const CREATE_STEPS: WizardStepId[] = ['identity', 'technical', 'admin', 'associate', 'summary', 'documents'];
const EDIT_STEPS: WizardStepId[] = ['identity', 'technical', 'admin', 'associate', 'documents'];

/** Spanish message for the checklist: the mapped error text when we know it, otherwise the backend detail. */
const describeError = (error: unknown): string => {
  const normalized = normalizeApiError(error, 'No se pudo completar la acción.');
  if (normalized.status === 0) return NETWORK_ERROR_MESSAGE;
  if (normalized.status >= 500) return 'El servidor no pudo completar la acción. Inténtalo de nuevo en unos minutos.';
  const mapped = findErrorMessage(normalized, ['common', 'vehicles']);
  return mapped.title === 'Error inesperado' ? normalized.detail : mapped.message;
};

const stepOfField = (field: string): WizardStepId => {
  const entry = (Object.entries(STEP_FIELDS) as [WizardStepId, string[]][]).find(([, fields]) => fields.includes(field));
  return entry ? entry[0] : 'identity';
};

const VehicleWizard = (props: VehicleWizardProps) => {
  const { user } = useUser();
  const router = useRouter();
  const isEdit = props.mode === 'edit';
  const vehicle = props.mode === 'edit' ? props.vehicle : null;

  const steps = isEdit ? EDIT_STEPS : CREATE_STEPS;
  const initialValues = useMemo(() => (vehicle ? vehicleToFormValues(vehicle) : DEFAULT_VEHICLE_FORM_VALUES), [vehicle]);
  const schema = useMemo(
    () => buildVehicleSchema({ initialPolicyDate: vehicle ? initialValues.policyExpirationDate : undefined }),
    [vehicle, initialValues],
  );

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(schema) as Resolver<VehicleFormValues>,
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const catalogs = useVehicleCatalogs();
  const vehicleService = useMemo(() => new VehicleService(SingletonAPIClient.getInstance()), []);
  const imageService = useMemo(() => new ImageService(SingletonAPIClient.getInstance()), []);

  const initialAgency = useMemo(() => (vehicle?.agencyImage ? [createExistingImage(vehicle.agencyImage)] : []), [vehicle]);
  const initialPhotos = useMemo(() => (vehicle?.photos ?? []).map(createExistingImage), [vehicle]);

  const [stepIndex, setStepIndex] = useState(0);
  const [agencyImages, setAgencyImages] = useState<ImageItem[]>(initialAgency);
  const [photos, setPhotos] = useState<ImageItem[]>(initialPhotos);
  const [carId, setCarId] = useState<string | null>(vehicle?.id ?? null);
  const [folioState, setFolioState] = useState<FolioState>({ status: 'idle', folio: '' });
  const [taskViews, setTaskViews] = useState<SaveTaskView[]>([]);
  const [progressOpen, setProgressOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const carIdRef = useRef<string | null>(vehicle?.id ?? null);
  const folioRef = useRef('');
  const tasksRef = useRef<SaveTask[]>([]);
  const uploadedRef = useRef<Record<string, string>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const stepId = steps[stepIndex];
  const isCreate = !isEdit;
  const carCreated = isCreate && !!carId;

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [stepIndex]);

  const publishTasks = () =>
    setTaskViews(tasksRef.current.map(({ key, label, status, error }) => ({ key, label, status, error })));

  /* ---------- Folio (create mode) ---------- */

  const loadFolio = useCallback(async (): Promise<string | null> => {
    const values = form.getValues();
    setFolioState({ status: 'loading', folio: '' });

    try {
      const { folio } = await vehicleService.computeFolio({
        associateId: Number(values.associateId),
        legalOwnerIsPegazzo: values.legalOwnerIsPegazzo,
        make: values.make,
        model: values.model,
        transmission: values.transmission,
      });
      folioRef.current = folio;
      setFolioState({ status: 'ready', folio });
      return folio;
    } catch (error) {
      setFolioState({ status: 'error', folio: '', message: describeError(error) });
      return null;
    }
  }, [form, vehicleService]);

  /* ---------- Save chain ---------- */

  const runChain = async () => {
    setIsSaving(true);

    for (const task of tasksRef.current) {
      if (task.status === 'done') continue;

      task.status = 'running';
      task.error = undefined;
      publishTasks();

      try {
        await task.run();
        task.status = 'done';
      } catch (error) {
        task.status = 'error';
        task.error = describeError(error);
      }
      publishTasks();

      // Everything else depends on the main record, so stop there if it could not be created.
      if (task.key === 'car' && task.status === 'error') break;
    }

    setIsSaving(false);

    if (tasksRef.current.every((task) => task.status === 'done')) {
      if (isCreate) {
        ToastService.success('Coche creado', `${folioRef.current} se registró correctamente.`);
        setProgressOpen(false);
        setStepIndex(steps.indexOf('documents'));
      } else {
        ToastService.success('Cambios guardados', 'El coche se actualizó correctamente.');
        setProgressOpen(false);
        router.push(`/coches/${encodeURIComponent(vehicle!.id)}`);
        router.refresh();
      }
    }
  };

  const attach = (key: string, label: string, file: File, kind: 'agency' | 'photo'): SaveTask => ({
    key,
    label,
    status: 'pending',
    run: async () => {
      const id = carIdRef.current!;
      // A previous attempt may have uploaded the binary already; only the attach step is retried then.
      let url = uploadedRef.current[key];
      if (!url) {
        url = await imageService.upload(file, kind === 'agency' ? 'car_agency_image' : 'car_photo', id);
        uploadedRef.current[key] = url;
      }
      if (kind === 'agency') await imageService.setCarAgencyImage(id, url);
      else await imageService.addCarPhoto(id, url);
    },
  });

  const imageTasks = (): SaveTask[] => {
    const tasks: SaveTask[] = [];
    const agencyFile = agencyImages.find((item) => item.file);
    if (agencyFile?.file) tasks.push(attach(`agency-${agencyFile.id}`, 'Imagen de agencia', agencyFile.file, 'agency'));

    photos
      .filter((item) => item.file)
      .forEach((item, index) => tasks.push(attach(`photo-${item.id}`, `Foto ${index + 1}`, item.file!, 'photo')));

    return tasks;
  };

  const createCarTask = (): SaveTask => ({
    key: 'car',
    label: 'Crear coche',
    status: 'pending',
    run: async () => {
      const values = form.getValues();
      const attempt = (id: string) => vehicleService.createVehicle(toCreatePayload(values, id));
      let id = folioRef.current;

      try {
        await attempt(id);
      } catch (error) {
        const normalized = normalizeApiError(error);
        // The consecutive is derived from the associate's car count, so a concurrent creation can take the folio.
        if (normalized.status === 400 && normalized.detail.startsWith('A car with id')) {
          const fresh = await loadFolio();
          if (!fresh) throw error;
          id = fresh;
          await attempt(id);
        } else {
          throw error;
        }
      }

      carIdRef.current = id;
      setCarId(id);
    },
  });

  const startCreate = async () => {
    if (!folioRef.current || folioState.status !== 'ready') {
      ToastService.error('Folio pendiente', 'Espera a que se calcule el folio o reinténtalo.');
      return;
    }

    tasksRef.current = [createCarTask(), ...imageTasks()];
    publishTasks();
    setProgressOpen(true);
    await runChain();
  };

  const startEdit = async () => {
    const valid = await form.trigger();
    if (!valid) {
      const firstInvalid = Object.keys(form.formState.errors)[0];
      const target = steps.indexOf(stepOfField(firstInvalid));
      if (target >= 0) setStepIndex(target);
      ToastService.error('Revisa el formulario', 'Hay campos con errores. Corrígelos para guardar.');
      return;
    }

    const payload: VehicleUpdate = toUpdatePayload(form.getValues(), initialValues);
    const initialAgencyUrl = vehicle?.agencyImage ?? null;
    const agencyRemoved = !!initialAgencyUrl && agencyImages.length === 0;
    if (agencyRemoved) payload.agencyImage = null;

    const keptPhotoIds = new Set(photos.filter((item) => !item.file).map((item) => item.id));
    const removedPhotos = (vehicle?.photos ?? []).filter((url) => !keptPhotoIds.has(url));

    const tasks: SaveTask[] = [];
    if (Object.keys(payload).length > 0) {
      tasks.push({
        key: 'car',
        label: 'Guardar datos del coche',
        status: 'pending',
        run: async () => {
          await vehicleService.updateVehicle(vehicle!.id, payload);
        },
      });
    }
    tasks.push(
      ...imageTasks().filter((task) => task.key.startsWith('agency')),
      ...removedPhotos.map<SaveTask>((url, index) => ({
        key: `remove-${url}`,
        label: `Quitar foto ${index + 1}`,
        status: 'pending',
        run: async () => imageService.removeCarPhoto(vehicle!.id, url),
      })),
      ...imageTasks().filter((task) => task.key.startsWith('photo')),
    );

    if (tasks.length === 0) {
      ToastService.info('Sin cambios', 'No hay nada que guardar.');
      return;
    }

    tasksRef.current = tasks;
    publishTasks();
    setProgressOpen(true);
    await runChain();
  };

  /* ---------- Navigation ---------- */

  const goNext = async () => {
    if (stepId in STEP_FIELDS) {
      const valid = await form.trigger(STEP_FIELDS[stepId as keyof typeof STEP_FIELDS]);
      if (!valid) {
        ToastService.error('Revisa el formulario', 'Corrige los campos marcados para continuar.');
        return;
      }
    }

    const next = steps[stepIndex + 1];
    if (next === 'summary') void loadFolio();
    setStepIndex((index) => index + 1);
  };

  const goBack = () => setStepIndex((index) => Math.max(0, index - 1));

  const handleStepClick = (index: number) => setStepIndex(index);

  const primaryAction = () => {
    if (isEdit) return void startEdit();
    if (stepId === 'summary') return void startCreate();
    if (stepId === 'documents') return void router.push('/coches');
    void goNext();
  };

  /* ---------- Render ---------- */

  if (user.role === Role.EMPLOYEE) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <ShieldAlert className="text-warning-700 size-10" aria-hidden />
          <p className="typo-subtitle text-carbon-500">Sin permiso</p>
          <p className="typo-sm-text text-carbon-300">Solo propietarios y administradores pueden {isEdit ? 'editar' : 'registrar'} coches.</p>
          <Button asChild className="cursor-pointer">
            <Link href="/coches">Volver al listado</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const values = form.watch();
  const title = isEdit ? 'Editar coche' : 'Agregar coche';
  const crumb = isEdit ? getVehicleTitle(vehicle!) : 'Agregar coche';
  const isDocumentsStep = stepId === 'documents';

  return (
    <div ref={topRef} className="mx-auto flex max-w-[920px] scroll-mt-6 flex-col gap-6">
      <header className="flex flex-col gap-3">
        <nav aria-label="Ruta de navegación" className="text-carbon-300 flex items-center gap-1.5 text-sm">
          <Link href="/coches" className="hover:text-primary-800 hover:underline">
            Coches
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          {isEdit && (
            <>
              <Link href={`/coches/${encodeURIComponent(vehicle!.id)}`} className="hover:text-primary-800 hover:underline">
                {crumb}
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
            </>
          )}
          <span className="text-carbon-500 font-medium" aria-current="page">
            {isEdit ? 'Editar' : crumb}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="typo-title text-carbon-500">{title}</h1>
          {isEdit && (
            <span
              className="bg-secondary-50 text-carbon-400 font-numbers rounded-md px-2.5 py-1 text-sm"
              title="El folio interno no se puede editar"
            >
              <span className="sr-only">Folio interno (solo lectura): </span>
              {vehicle!.id}
            </span>
          )}
        </div>
      </header>

      <WizardStepper
        steps={steps.map((id) => ({ id, label: STEP_LABELS[id] }))}
        currentIndex={stepIndex}
        completedUntil={stepIndex}
        freeNavigation={isEdit}
        lockedUntil={carCreated ? steps.indexOf('summary') : -1}
        onStepClick={handleStepClick}
      />

      <Form {...form}>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!isDocumentsStep) primaryAction();
          }}
          className="flex flex-col gap-6"
        >
          {stepId === 'identity' && (
            <IdentityStep
              form={form}
              catalogs={catalogs}
              agencyImages={agencyImages}
              onAgencyImagesChange={setAgencyImages}
              showFolioNotice={isCreate}
            />
          )}
          {stepId === 'technical' && <TechnicalStep form={form} photos={photos} onPhotosChange={setPhotos} />}
          {stepId === 'admin' && <AdminStep form={form} catalogs={catalogs} />}
          {stepId === 'associate' && <AssociateStep form={form} catalogs={catalogs} />}
          {stepId === 'summary' && (
            <SummaryStep
              values={values}
              folioState={folioState}
              onRetryFolio={() => void loadFolio()}
              insurance={catalogs.insurances.find((insurance) => String(insurance.id) === values.insuranceProviderId)}
              associate={catalogs.associates.find((associate) => String(associate.id) === values.associateId)}
              agencyImageCount={agencyImages.length}
              photoCount={photos.length}
            />
          )}
          {isDocumentsStep && carId && (
            <DocumentsStep
              carId={carId}
              isLiquidated={values.isFinancedLiquidated}
              policyExpirationDate={values.policyExpirationDate}
              existingDocuments={vehicle?.documents}
            />
          )}

          <footer className="flex items-center justify-between gap-3">
            {isEdit || stepIndex === 0 ? (
              <Button asChild variant="outline" className="cursor-pointer">
                <Link href={isEdit ? `/coches/${encodeURIComponent(vehicle!.id)}` : '/coches'}>Cancelar</Link>
              </Button>
            ) : isDocumentsStep ? (
              <span />
            ) : (
              <Button type="button" variant="outline" onClick={goBack} disabled={isSaving} className="cursor-pointer gap-2">
                <ArrowLeft className="size-4" /> Atrás
              </Button>
            )}

            {isEdit ? (
              <Button
                type="button"
                onClick={primaryAction}
                disabled={isSaving}
                className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer"
              >
                Guardar cambios
              </Button>
            ) : stepId === 'summary' ? (
              <Button
                type="button"
                onClick={primaryAction}
                disabled={isSaving || folioState.status !== 'ready'}
                className="bg-success-500 hover:bg-success-700 cursor-pointer text-white"
              >
                Crear coche
              </Button>
            ) : isDocumentsStep ? (
              <Button type="button" onClick={primaryAction} className="bg-success-500 hover:bg-success-700 cursor-pointer text-white">
                Finalizar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={primaryAction}
                className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer gap-2"
              >
                Siguiente <ArrowRight className="size-4" />
              </Button>
            )}
          </footer>
        </form>
      </Form>

      <SaveProgressDialog
        open={progressOpen}
        title={isEdit ? 'Guardando cambios' : 'Creando coche'}
        tasks={taskViews}
        isRunning={isSaving}
        continueLabel={isEdit ? 'Cerrar' : 'Continuar a documentos'}
        canContinue={isEdit || !!carIdRef.current}
        onRetry={() => void runChain()}
        onContinue={() => {
          setProgressOpen(false);
          if (isCreate && carIdRef.current) setStepIndex(steps.indexOf('documents'));
        }}
      />
    </div>
  );
};

export default VehicleWizard;
