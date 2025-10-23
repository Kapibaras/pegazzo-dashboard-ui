const formatterLongDatetime = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export const formatLongDatetime = (dateString: string) => {
  const date = new Date(dateString);
  return formatterLongDatetime.format(date);
};
