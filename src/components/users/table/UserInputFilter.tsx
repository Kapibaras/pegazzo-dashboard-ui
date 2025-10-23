import { Table as TableType } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { UserTableData } from './columns';
import { useEffect, useState } from 'react';

const UserInputFilter = ({ table }: { table: TableType<UserTableData> }) => {
  const searchCol = table.getColumn('search');
  const [value, setValue] = useState((searchCol?.getFilterValue() as string) ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchCol?.setFilterValue(value);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, searchCol]);

  return (
    <Input
      id="Buscar usuario..."
      name="Buscar usuario..."
      placeholder="Buscar usuario..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="typo-text border-surface-700 bg-surface-400 mt-0.5 flex max-w-md items-center self-stretch rounded-md border px-2.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
    />
  );
};

export default UserInputFilter;
