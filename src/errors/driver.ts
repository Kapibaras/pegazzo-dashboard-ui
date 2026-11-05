export const DRIVER_ERRORS = {
  DRIVER_NOT_FOUND: {
    status: 404,
    backendDetailStartsWith: 'Driver with id',
    title: 'Conductor no encontrado',
    message: 'No se encontró el conductor especificado.',
  },
  LICENSE_IN_PAST: {
    status: 400,
    backendDetail: 'License validity cannot be a past date',
    title: 'Vigencia de licencia inválida',
    message: 'La vigencia de la licencia no puede estar en el pasado.',
  },
  IDENTIFICATION_EXISTS: {
    status: 400,
    backendDetailStartsWith: 'Identification number',
    title: 'Identificación duplicada',
    message: 'Ya existe un conductor registrado con ese número de identificación.',
  },
  LICENSE_NUMBER_EXISTS: {
    status: 400,
    backendDetailStartsWith: 'License number',
    title: 'Licencia duplicada',
    message: 'Ya existe un conductor registrado con ese número de licencia.',
  },
  HAS_ACTIVE_CONTRACT: {
    status: 400,
    backendDetailStartsWith: 'Cannot archive driver',
    title: 'No se puede archivar',
    message: 'El conductor tiene un contrato vigente o próximo. Termínalo antes de archivarlo.',
  },
  MUST_BE_ARCHIVED: {
    status: 400,
    backendDetailStartsWith: "Driver '",
    title: 'Primero archiva el conductor',
    message: 'Solo se pueden eliminar conductores que ya estén archivados.',
  },
  MAX_GUARANTORS: {
    status: 409,
    backendDetailStartsWith: "Driver '",
    title: 'Límite de avales',
    message: 'Un conductor puede tener máximo 5 avales. Elimina uno antes de agregar otro.',
  },
  GUARANTOR_NOT_FOUND: {
    status: 404,
    backendDetailStartsWith: 'Guarantor',
    title: 'Aval no encontrado',
    message: 'El aval ya no existe o no pertenece a este conductor. Actualiza la página.',
  },
  INVALID_CONTENT_TYPE: {
    status: 400,
    backendDetailStartsWith: 'Content type',
    title: 'Formato no permitido',
    message: 'El tipo de archivo no es válido. Usa JPG, PNG, WEBP o PDF según corresponda.',
  },
  DOCUMENT_NOT_FOUND: {
    status: 404,
    backendDetailStartsWith: 'Document with id',
    title: 'Documento no encontrado',
    message: 'El documento ya no existe. Actualiza la página.',
  },
  FORBIDDEN: {
    status: 403,
    backendDetail: 'Forbidden',
    title: 'Sin permiso',
    message: 'No tienes permiso para realizar esta acción.',
  },
};
