import { DriverWizard } from '@/components/drivers';

/**
 * CSR on purpose: the wizard keeps several steps (and the `File` picked for the photo) in memory and needs no
 * server-side data. Only the final save talks to the API.
 */
const NewDriverPage = () => <DriverWizard mode="create" />;

export default NewDriverPage;
