'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, ChevronRight, ShieldAlert } from 'lucide-react';
import { Resolver, useForm } from 'react-hook-form';
import { SingletonAPIClient } from '@/api';
import { StoredDocument } from '@/components/common/files/DocumentUpload';
import { createExistingImage, ImageItem, revokeStagedImages } from '@/components/common/files/ImageUpload';
import SaveProgressDialog, { SaveTaskView } from '@/components/common/wizard/SaveProgressDialog';
import WizardStepper from '@/components/common/wizard/WizardStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useUser } from '@/contexts/UserProvider';
import findErrorMessage from '@/errors/findErrorMessage';
import { NETWORK_ERROR_MESSAGE, normalizeApiError } from '@/helpers/apiError';
import {
  REQUIRED_DRIVER_DOCUMENT_TYPES,
  REQUIRED_GARAGE_DOCUMENT_TYPES,
  REQUIRED_GUARANTOR_DOCUMENT_TYPES,
  currentDocumentsByType,
  getDriverFullName,
} from '@/lib/driver';
import {
  buildDriverSchema,
  DEFAULT_DRIVER_FORM_VALUES,
  diffGarages,
  diffGuarantors,
  driverToFormValues,
  DriverFormValues,
  STEP_FIELDS,
  toCreatePayload,
  toGaragePayload,
  toGuarantorPayload,
  toUpdatePayload,
  WizardStepId,
} from '@/lib/schemas/driverSchema';
import { Role } from '@/lib/schemas/userSchema';
import DriverService from '@/services/driver';
import ImageService from '@/services/images';
import { ToastService } from '@/services/toast';
import { DriverDetail } from '@/types/driver';
import AddressStep, { LegacyAddresses } from './AddressStep';
import DataStep from './DataStep';
import DocumentsStep from './DocumentsStep';
import GuarantorsStep from './GuarantorsStep';
import PhotoStep from './PhotoStep';
import SummaryStep from './SummaryStep';

type DriverWizardProps =
  | { mode: 'create' }
  | {
      mode: 'edit';
      driver: DriverDetail;
      /** Step to open first (e.g. the documents step from a "Completar documentos" link). */
      initialStep?: WizardStepId;
    };

type SaveTask = SaveTaskView & { run: () => Promise<void> };

const STEP_LABELS: Record<WizardStepId, string> = {
  data: 'Datos',
  address: 'Domicilio',
  photo: 'Foto',
  guarantors: 'Avales',
  summary: 'Resumen',
  documents: 'Documentación',
};

const CREATE_STEPS: WizardStepId[] = ['data', 'address', 'photo', 'guarantors', 'summary', 'documents'];
const EDIT_STEPS: WizardStepId[] = ['data', 'address', 'photo', 'guarantors', 'documents'];

/** Keeps only what the upload slots need (id + presigned url) from the documents of a detail response. */
const toStored = (documents: Record<string, { id: number; url: string }>): Record<string, StoredDocument> =>
  Object.fromEntries(Object.entries(documents).map(([type, doc]) => [type, { id: doc.id, url: doc.url }]));

/** Spanish message for the checklist: the mapped error text when we know it, otherwise the backend detail. */
const describeError = (error: unknown): string => {
  const normalized = normalizeApiError(error, 'No se pudo completar la acción.');
  if (normalized.status === 0) return NETWORK_ERROR_MESSAGE;
  if (normalized.status >= 500) return 'El servidor no pudo completar la acción. Inténtalo de nuevo en unos minutos.';
  const mapped = findErrorMessage(normalized, ['common', 'drivers']);
  return mapped.title === 'Error inesperado' ? normalized.detail : mapped.message;
};

const stepOfField = (field: string): WizardStepId => {
  const entry = (Object.entries(STEP_FIELDS) as [WizardStepId, string[]][]).find(([, fields]) =>
    fields.includes(field),
  );
  return entry ? entry[0] : 'data';
};

const DriverWizard = (props: DriverWizardProps) => {
  const { user } = useUser();
  const router = useRouter();
  const isEdit = props.mode === 'edit';
  const driver = props.mode === 'edit' ? props.driver : null;

  const steps = isEdit ? EDIT_STEPS : CREATE_STEPS;
  const initialValues = useMemo(() => (driver ? driverToFormValues(driver) : DEFAULT_DRIVER_FORM_VALUES), [driver]);
  const schema = useMemo(
    () => buildDriverSchema({ initialLicenseValidity: driver ? initialValues.licenseValidity : undefined }),
    [driver, initialValues],
  );

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(schema) as Resolver<DriverFormValues>,
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const driverService = useMemo(() => new DriverService(SingletonAPIClient.getInstance()), []);
  const imageService = useMemo(() => new ImageService(SingletonAPIClient.getInstance()), []);

  const initialPhotos = useMemo(() => (driver?.photo ? [createExistingImage(driver.photo)] : []), [driver]);

  const [stepIndex, setStepIndex] = useState(() =>
    props.mode === 'edit' && props.initialStep ? Math.max(0, steps.indexOf(props.initialStep)) : 0,
  );
  const [photos, setPhotos] = useState<ImageItem[]>(initialPhotos);
  // The current document of each type (driver and each guarantor). They live here so they survive navigating between
  // steps; when a type has several documents (old uploads) the newest one is the current one.
  const [storedDocuments, setStoredDocuments] = useState<Record<string, StoredDocument>>(() =>
    toStored(currentDocumentsByType(driver?.documents ?? [])),
  );
  const [guarantorDocuments, setGuarantorDocuments] = useState<Record<number, Record<string, StoredDocument>>>(() =>
    Object.fromEntries(
      (driver?.guarantors ?? []).map((guarantor) => [
        guarantor.id,
        toStored(currentDocumentsByType(guarantor.documents ?? [])),
      ]),
    ),
  );
  const [garageDocuments, setGarageDocuments] = useState<Record<number, Record<string, StoredDocument>>>(() =>
    Object.fromEntries(
      (driver?.garages ?? []).map((garage) => [garage.id, toStored(currentDocumentsByType(garage.documents ?? []))]),
    ),
  );
  // Addresses saved as free text before the split into fields: shown so the user can re-enter them by fields.
  const legacyAddresses = useMemo<LegacyAddresses>(
    () => ({
      driver: driver && !driver.addressFields ? driver.address : null,
      garages: Object.fromEntries(
        (driver?.garages ?? []).filter((garage) => !garage.addressFields).map((garage) => [garage.id, garage.address]),
      ),
      guarantors: Object.fromEntries(
        (driver?.guarantors ?? [])
          .filter((guarantor) => !guarantor.addressFields)
          .map((guarantor) => [guarantor.id, guarantor.address]),
      ),
    }),
    [driver],
  );
  const handleDocumentChange = useCallback(
    (type: string, document: StoredDocument) => setStoredDocuments((prev) => ({ ...prev, [type]: document })),
    [],
  );
  const handleGarageDocumentChange = useCallback(
    (garageId: number, type: string, document: StoredDocument) =>
      setGarageDocuments((prev) => ({ ...prev, [garageId]: { ...prev[garageId], [type]: document } })),
    [],
  );
  const handleGuarantorDocumentChange = useCallback(
    (guarantorId: number, type: string, document: StoredDocument) =>
      setGuarantorDocuments((prev) => ({ ...prev, [guarantorId]: { ...prev[guarantorId], [type]: document } })),
    [],
  );

  const [driverId, setDriverId] = useState<string | null>(driver?.id ?? null);
  const [taskViews, setTaskViews] = useState<SaveTaskView[]>([]);
  const [progressOpen, setProgressOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const driverIdRef = useRef<string | null>(driver?.id ?? null);
  const tasksRef = useRef<SaveTask[]>([]);
  const uploadedRef = useRef<Record<string, string>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const stepId = steps[stepIndex];
  const isCreate = !isEdit;
  const driverCreated = isCreate && !!driverId;

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [stepIndex]);

  // The staged preview lives here (it must survive going back and forth between steps), so it is freed here when the
  // wizard goes away.
  const stagedImagesRef = useRef<ImageItem[]>([]);
  stagedImagesRef.current = photos;
  useEffect(() => () => revokeStagedImages(stagedImagesRef.current), []);

  const publishTasks = () =>
    setTaskViews(tasksRef.current.map(({ key, label, status, error }) => ({ key, label, status, error })));

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
      if (task.key === 'driver' && task.status === 'error') break;
    }

    setIsSaving(false);

    if (tasksRef.current.every((task) => task.status === 'done')) {
      if (isCreate) {
        ToastService.success('Conductor creado', `${driverIdRef.current} se registró correctamente.`);
        setProgressOpen(false);
        setStepIndex(steps.indexOf('documents'));
      } else {
        ToastService.success('Cambios guardados', 'El conductor se actualizó correctamente.');
        setProgressOpen(false);
        router.push(`/conductores/${encodeURIComponent(driver!.id)}`);
        router.refresh();
      }
    }
  };

  const photoTask = (): SaveTask | null => {
    const staged = photos.find((item) => item.file);
    if (!staged?.file) return null;

    const key = `photo-${staged.id}`;
    return {
      key,
      label: 'Subir foto',
      status: 'pending',
      run: async () => {
        const id = driverIdRef.current!;
        // A previous attempt may have uploaded the binary already; only the attach step is retried then.
        let url = uploadedRef.current[key];
        if (!url) {
          url = await imageService.upload(staged.file!, 'driver_photo', id);
          uploadedRef.current[key] = url;
        }
        await imageService.setDriverPhoto(id, url);
      },
    };
  };

  /** Creates one guarantor and stores its id in the form so the documents step can upload against it. */
  const createGuarantorTask = (index: number, label: string, snapshot: DriverFormValues): SaveTask => ({
    key: `guarantor-new-${index}`,
    label: `Registrar aval: ${label}`,
    status: 'pending',
    run: async () => {
      const created = await driverService.createGuarantor(
        driverIdRef.current!,
        toGuarantorPayload(snapshot.guarantors[index]),
      );
      form.setValue(`guarantors.${index}.guarantorId`, created.id);
    },
  });

  /** Creates one garage and stores its id in the form so the documents step can upload its address proof. */
  const createGarageTask = (index: number, label: string, snapshot: DriverFormValues): SaveTask => ({
    key: `garage-new-${index}`,
    label: `Registrar cochera: ${label}`,
    status: 'pending',
    run: async () => {
      const created = await driverService.createGarage(driverIdRef.current!, toGaragePayload(snapshot.garages[index]));
      form.setValue(`garages.${index}.garageId`, created.id);
    },
  });

  const startCreate = async () => {
    // The driver already exists (a previous attempt got past the first task): only the pending tasks are retried.
    if (driverIdRef.current && tasksRef.current.length > 0) {
      publishTasks();
      setProgressOpen(true);
      await runChain();
      return;
    }

    const snapshot = form.getValues();
    const tasks: SaveTask[] = [
      {
        key: 'driver',
        label: 'Crear conductor',
        status: 'pending',
        run: async () => {
          const created = await driverService.createDriver(toCreatePayload(snapshot));
          driverIdRef.current = created.id;
          setDriverId(created.id);
        },
      },
    ];

    const photo = photoTask();
    if (photo) tasks.push(photo);

    snapshot.garages.forEach((garage, index) =>
      tasks.push(createGarageTask(index, `${garage.address.street} ${garage.address.exteriorNumber}`.trim(), snapshot)),
    );
    snapshot.guarantors.forEach((guarantor, index) =>
      tasks.push(createGuarantorTask(index, `${guarantor.name} ${guarantor.surnames}`.trim(), snapshot)),
    );

    tasksRef.current = tasks;
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

    const snapshot = form.getValues();
    const payload = toUpdatePayload(snapshot, initialValues);
    const changes = diffGuarantors(snapshot.guarantors, initialValues.guarantors);
    const garageChanges = diffGarages(snapshot.garages, initialValues.garages);
    const photoRemoved = !!driver?.photo && photos.length === 0;

    const tasks: SaveTask[] = [];
    if (Object.keys(payload).length > 0) {
      tasks.push({
        key: 'driver',
        label: 'Guardar datos del conductor',
        status: 'pending',
        run: async () => {
          await driverService.updateDriver(driver!.id, payload);
        },
      });
    }
    if (photoRemoved) {
      tasks.push({
        key: 'remove-photo',
        label: 'Quitar la foto',
        status: 'pending',
        run: async () => {
          await driverService.updateDriver(driver!.id, { photo: null });
        },
      });
    }
    const photo = photoTask();
    if (photo) tasks.push(photo);

    changes.removed.forEach(({ id, label }) =>
      tasks.push({
        key: `guarantor-remove-${id}`,
        label: `Quitar aval: ${label}`,
        status: 'pending',
        run: async () => driverService.removeGuarantor(driver!.id, id),
      }),
    );
    changes.updated.forEach(({ id, payload: guarantorPayload, label }) =>
      tasks.push({
        key: `guarantor-update-${id}`,
        label: `Actualizar aval: ${label}`,
        status: 'pending',
        run: async () => {
          await driverService.updateGuarantor(driver!.id, id, guarantorPayload);
        },
      }),
    );
    changes.added.forEach((guarantor) => {
      const index = snapshot.guarantors.indexOf(guarantor);
      tasks.push(createGuarantorTask(index, `${guarantor.name} ${guarantor.surnames}`.trim(), snapshot));
    });

    garageChanges.removed.forEach((id) =>
      tasks.push({
        key: `garage-remove-${id}`,
        label: 'Quitar cochera',
        status: 'pending',
        run: async () => driverService.removeGarage(driver!.id, id),
      }),
    );
    garageChanges.updated.forEach(({ id, payload: garagePayload }) =>
      tasks.push({
        key: `garage-update-${id}`,
        label: 'Actualizar cochera',
        status: 'pending',
        run: async () => {
          await driverService.updateGarage(driver!.id, id, garagePayload);
        },
      }),
    );
    garageChanges.added.forEach((garage) => {
      const index = snapshot.garages.indexOf(garage);
      tasks.push(createGarageTask(index, `${garage.address.street} ${garage.address.exteriorNumber}`.trim(), snapshot));
    });

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

    setStepIndex((index) => index + 1);
  };

  const goBack = () => setStepIndex((index) => Math.max(0, index - 1));

  const primaryAction = () => {
    if (isEdit) return void startEdit();
    if (stepId === 'summary') return void startCreate();
    if (stepId === 'documents') return void router.push('/conductores');
    void goNext();
  };

  /* ---------- Render ---------- */

  if (user.role === Role.EMPLOYEE) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <ShieldAlert className="text-warning-700 size-10" aria-hidden />
          <p className="typo-subtitle text-carbon-500">Sin permiso</p>
          <p className="typo-sm-text text-carbon-300">
            Solo propietarios y administradores pueden {isEdit ? 'editar' : 'registrar'} conductores.
          </p>
          <Button asChild className="cursor-pointer">
            <Link href="/conductores">Volver al listado</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const values = form.watch();
  const title = isEdit ? 'Editar conductor' : 'Agregar conductor';
  const crumb = isEdit ? getDriverFullName(driver!) : 'Agregar conductor';
  const isDocumentsStep = stepId === 'documents';

  const requiredCount =
    REQUIRED_DRIVER_DOCUMENT_TYPES.length +
    values.guarantors.length * REQUIRED_GUARANTOR_DOCUMENT_TYPES.length +
    values.garages.length * REQUIRED_GARAGE_DOCUMENT_TYPES.length;
  const missingCount =
    REQUIRED_DRIVER_DOCUMENT_TYPES.filter((type) => !storedDocuments[type]).length +
    values.garages.reduce(
      (sum, garage) =>
        sum +
        REQUIRED_GARAGE_DOCUMENT_TYPES.filter(
          (type) => garage.garageId === undefined || !garageDocuments[garage.garageId]?.[type],
        ).length,
      0,
    ) +
    values.guarantors.reduce(
      (sum, guarantor) =>
        sum +
        REQUIRED_GUARANTOR_DOCUMENT_TYPES.filter(
          (type) => guarantor.guarantorId === undefined || !guarantorDocuments[guarantor.guarantorId]?.[type],
        ).length,
      0,
    );

  /** The driver is already saved, so the user may leave without all the documents; they stay pending for the edit form. */
  const leaveWithoutAllDocuments = () => {
    ToastService.info(
      'Documentación pendiente',
      `Faltan ${missingCount} ${missingCount === 1 ? 'documento' : 'documentos'}. Mientras falten no podrás activar al conductor; cárgalos desde su detalle o su edición.`,
    );
    router.push('/conductores');
  };

  return (
    <div ref={topRef} className="mx-auto flex max-w-[920px] scroll-mt-6 flex-col gap-6">
      <header className="flex flex-col gap-3">
        <nav aria-label="Ruta de navegación" className="typo-sm-text text-carbon-300 flex items-center gap-1.5">
          <Link href="/conductores" className="hover:text-primary-800 hover:underline">
            Conductores
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          {isEdit && (
            <>
              <Link
                href={`/conductores/${encodeURIComponent(driver!.id)}`}
                className="hover:text-primary-800 hover:underline"
              >
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
          {(isEdit || driverId) && (
            <span
              className="typo-sm-text bg-secondary-50 text-carbon-400 font-numbers rounded-md px-2.5 py-1"
              title="El folio interno no se puede editar"
            >
              <span className="sr-only">Folio interno (solo lectura): </span>
              {driverId ?? driver!.id}
            </span>
          )}
        </div>
      </header>

      <WizardStepper
        steps={steps.map((id) => ({ id, label: STEP_LABELS[id] }))}
        currentIndex={stepIndex}
        completedUntil={stepIndex}
        freeNavigation={isEdit}
        lockedUntil={driverCreated ? steps.indexOf('summary') : -1}
        onStepClick={setStepIndex}
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
          {stepId === 'data' && <DataStep form={form} showFolioNotice={isCreate} />}
          {stepId === 'address' && <AddressStep form={form} legacy={legacyAddresses} />}
          {stepId === 'photo' && <PhotoStep photos={photos} onPhotosChange={setPhotos} />}
          {stepId === 'guarantors' && <GuarantorsStep form={form} legacy={legacyAddresses} />}
          {stepId === 'summary' && <SummaryStep values={values} hasPhoto={photos.length > 0} />}
          {isDocumentsStep && driverId && (
            <DocumentsStep
              driverId={driverId}
              licenseValidity={values.licenseValidity}
              storedDocuments={storedDocuments}
              onDocumentChange={handleDocumentChange}
              guarantors={values.guarantors.map((guarantor) => ({
                guarantorId: guarantor.guarantorId,
                label: `${guarantor.name} ${guarantor.surnames}`.trim(),
              }))}
              guarantorDocuments={guarantorDocuments}
              onGuarantorDocumentChange={handleGuarantorDocumentChange}
              garages={values.garages.map((garage) => ({ garageId: garage.garageId, address: garage.address }))}
              garageDocuments={garageDocuments}
              onGarageDocumentChange={handleGarageDocumentChange}
              missingCount={missingCount}
              requiredCount={requiredCount}
            />
          )}

          <footer className="flex items-center justify-between gap-3">
            {isEdit || stepIndex === 0 ? (
              <Button asChild variant="outline" className="cursor-pointer">
                <Link href={isEdit ? `/conductores/${encodeURIComponent(driver!.id)}` : '/conductores'}>Cancelar</Link>
              </Button>
            ) : isDocumentsStep ? (
              <Button type="button" variant="outline" onClick={leaveWithoutAllDocuments} className="cursor-pointer">
                Completar después
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={isSaving || driverCreated}
                className="cursor-pointer gap-2"
              >
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
                disabled={isSaving}
                className="bg-success-500 hover:bg-success-700 cursor-pointer text-white"
              >
                {driverCreated ? 'Reintentar pendientes' : 'Crear conductor'}
              </Button>
            ) : isDocumentsStep ? (
              <Button
                type="button"
                onClick={primaryAction}
                disabled={missingCount > 0}
                title={missingCount > 0 ? `Faltan ${missingCount} documentos obligatorios` : undefined}
                className="bg-success-500 hover:bg-success-700 cursor-pointer text-white"
              >
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
        title={isEdit ? 'Guardando cambios' : 'Creando conductor'}
        tasks={taskViews}
        isRunning={isSaving}
        continueLabel={isEdit ? 'Cerrar' : 'Continuar a documentos'}
        canContinue={isEdit || !!driverIdRef.current}
        onRetry={() => void runChain()}
        onClose={() => setProgressOpen(false)}
        onContinue={() => {
          setProgressOpen(false);
          if (isCreate && driverIdRef.current) setStepIndex(steps.indexOf('documents'));
        }}
      />
    </div>
  );
};

export default DriverWizard;
