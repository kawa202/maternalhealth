import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Search, Filter, UserPlus, Calendar, AlertCircle } from 'lucide-react';

type Patient = {
  id: number;
  user_id: number;
  user_full_name: string;
  role: string;
  phone: string;
  email: string;
  dueDate?: string;
  lastVisit?: string;
  status?: 'active' | 'inactive';
};

export function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      try {
        const user = localStorage.getItem('user');
        const userId = user ? JSON.parse(user).id : null;
  
        if (!userId) throw new Error('User not found');
  
        const response = await fetch(`http://localhost:8000/api/patients/?provider_id=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch patients');
  
        const data = await response.json();
        console.log('patients response:', data);
        setPatients(data.assigned_patients); 
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
  
    fetchPatients();
  }, []);
  

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.user_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div>Loading patients...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
        {/* <Button onClick={() => navigate('/patients/add')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Button> */}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<UserPlus className="h-6 w-6 text-primary" />} label="Total Patients" value={patients.length} />
        <StatCard icon={<Calendar className="h-6 w-6 text-success" />} label="Appointments Today" value={5} />
        <StatCard icon={<AlertCircle className="h-6 w-6 text-warning" />} label="High Risk Patients" value={2} />
      </div>

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {['Patient', 'Email', 'Phone Number', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    {/* <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900"></div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </div>
                    </div> */}
                    {patient.user_full_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                     {patient.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {patient.phone}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      patient.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status || 'N/A'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/patients/${patient.id}`)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: JSX.Element; label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-soft">
      <div className="flex items-center">
        <div className="rounded-full bg-primary/10 p-3">{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search patients..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function StatusFilter({ value, onChange }: { value: string; onChange: (val: any) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="all">All Patients</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
