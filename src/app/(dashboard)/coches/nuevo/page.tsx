import { VehicleWizard } from '@/components/vehicles';

/**
 * CSR on purpose: the wizard keeps many steps (and the `File`s picked for the images) in memory and needs no
 * server-side data. Only the final save talks to the API.
 */
const NewVehiclePage = () => <VehicleWizard mode="create" />;

export default NewVehiclePage;
