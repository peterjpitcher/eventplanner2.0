import { CustomerImport } from '@/components/customers/customer-import';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export const metadata = {
  title: 'Import Customers | Event Planner',
  description: 'Import multiple customers from a CSV file',
};

export default function ImportCustomersPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Customers', href: '/customers' },
          { label: 'Import Customers', href: '/customers/import', active: true },
        ]}
      />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Import Customers</h1>
        <p className="text-gray-600">
          Import multiple customers from a CSV file
        </p>
      </div>
      
      <CustomerImport 
        onImportComplete={() => {
          // Page will be refreshed if the user navigates back to the customer list
        }} 
      />
    </div>
  );
} 