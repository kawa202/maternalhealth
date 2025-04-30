import React, { useEffect, useState } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  assignedProvider?: string;
}

export default function Users() {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [newPatients, setNewPatients] = useState<Patient[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<'patients' | 'staff'>('patients');
  const [newStaff, setNewStaff] = useState({ first_name: '', last_name: '', email: '', phone_number: '', role: '', password: '' });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | ''>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/get_users/');
      const data = await response.json();

      const newMaternals = data.data.new_maternals || [];
      const assignedMaternals = data.data.assigned_maternals || [];
      const staff = data.data.staff || [];

      const formattedNewPatients: Patient[] = newMaternals.map((m: any) => ({
        id: m.id,
        name: m.user_full_name?.trim() || `Maternal ${m.user_id}`,
        email: m.email || `user${m.user_id}@example.com`,
        phone: m.phone || 'N/A',
      }));

      const formattedAssignedPatients: Patient[] = assignedMaternals.map((m: any) => ({
        id: m.id,
        name: m.user_full_name?.trim() || `Maternal ${m.user_id}`,
        email: m.email || `user${m.user_id}@example.com`,
        phone: m.phone || 'N/A',
        assignedProvider: m.provider_full_name,
      }));

      const formattedStaff: Staff[] = staff.map((s: any) => ({
        id: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        phone: s.phone,
        role: s.role,
      }));

      setNewPatients(formattedNewPatients);
      setAssignedPatients(formattedAssignedPatients);
      setStaffMembers(formattedStaff);

    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddStaff = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/add_staff/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      });

      if (response.ok) {
        alert('Staff member added successfully');
        setNewStaff({ first_name: '', last_name: '', email: '', phone_number: '', role: '', password: '' });
        fetchUsers();
      } else {
        alert('Failed to add staff.');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleAssignPatient = async () => {
    if (selectedPatient && selectedProvider !== '') {
      try {
        const response = await fetch('http://localhost:8000/api/assign_provider/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: selectedPatient.id,
            provider_id: selectedProvider,
          }),
        });

        if (response.ok) {
          alert('Provider assigned successfully');
          setShowModal(false);
          setSelectedPatient(null);
          setSelectedProvider('');
          fetchUsers();
        } else {
          alert('Failed to assign provider.');
        }
      } catch (error) {
        console.error('Error assigning provider:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'patients' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('patients')}
          >
            Patients
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'staff' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff
          </button>
        </div>
      </div>

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-soft">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Add Staff Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                className="p-2 border rounded-lg"
                type="text"
                placeholder="First Name"
                value={newStaff.first_name}
                onChange={(e) => setNewStaff({ ...newStaff, first_name: e.target.value })}
              />
              <input
                className="p-2 border rounded-lg"
                type="text"
                placeholder="Last Name"
                value={newStaff.last_name}
                onChange={(e) => setNewStaff({ ...newStaff, last_name: e.target.value })}
              />
              <input
                className="p-2 border rounded-lg"
                type="email"
                placeholder="Email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
              <input
                className="p-2 border rounded-lg"
                type="text"
                placeholder="Phone Number"
                value={newStaff.phone_number}
                onChange={(e) => setNewStaff({ ...newStaff, phone_number: e.target.value })}
              />
              <select
                className="p-2 border rounded-lg"
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
              <input
                className="p-2 border rounded-lg"
                type="password"
                placeholder="Password"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              />
            </div>
            <button
              className="mt-4 flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-white"
              onClick={handleAddStaff}
            >
              <Plus className="h-4 w-4" /> Add Staff
            </button>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Staff Members</h3>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 font-medium text-sm text-gray-700">First Name</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Last Name</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Email</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Phone</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Role</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="border-b">
                    <td className="p-2 text-sm text-gray-900">{staff.first_name}</td>
                    <td className="p-2 text-sm text-gray-900">{staff.last_name}</td>
                    <td className="p-2 text-sm text-gray-600">{staff.email}</td>
                    <td className="p-2 text-sm text-gray-600">{staff.phone || 'N/A'}</td>
                    <td className="p-2 text-sm text-gray-600">{staff.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-8">
          {/* New Patients */}
          <div className="rounded-lg bg-white p-4 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">New Patients</h3>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 font-medium text-sm text-gray-700">Name</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Email</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Phone</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {newPatients.map((patient) => (
                  <tr key={patient.id} className="border-b">
                    <td className="p-2 text-sm text-gray-900">{patient.name}</td>
                    <td className="p-2 text-sm text-gray-600">{patient.email}</td>
                    <td className="p-2 text-sm text-gray-600">{patient.phone}</td>
                    <td className="p-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <UserPlus className="w-4 h-4" /> Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assigned Patients */}
          <div className="rounded-lg bg-white p-4 shadow-soft">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Assigned Patients</h3>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 font-medium text-sm text-gray-700">Name</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Email</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Phone</th>
                  <th className="p-2 font-medium text-sm text-gray-700">Assigned Provider</th>
                </tr>
              </thead>
              <tbody>
                {assignedPatients.map((patient) => (
                  <tr key={patient.id} className="border-b">
                    <td className="p-2 text-sm text-gray-900">{patient.name}</td>
                    <td className="p-2 text-sm text-gray-600">{patient.email}</td>
                    <td className="p-2 text-sm text-gray-600">{patient.phone}</td>
                    <td className="p-2 text-sm text-gray-600">{patient.assignedProvider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Assigning Provider */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Assign Provider to {selectedPatient.name}</h3>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(Number(e.target.value))}
            >
              <option value="">Select Provider</option>
              {staffMembers
                .filter((staff) => staff.role === 'provider')
                .map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </option>
                ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800"
                onClick={() => {
                  setShowModal(false);
                  setSelectedPatient(null);
                  setSelectedProvider('');
                }}
              >
                Cancel
              </button>
              <button
                disabled={!selectedProvider}
                className="px-4 py-2 rounded-lg bg-primary text-white disabled:bg-primary/50"
                onClick={handleAssignPatient}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
