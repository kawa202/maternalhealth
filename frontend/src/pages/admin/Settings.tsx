import React, { useState, useEffect } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/switch';

export function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: ""
  });

  // Password state
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Medical History state
  const [medicalHistory, setMedicalHistory] = useState({
    conditions: "",
    medications: "",
    allergies: ""
  });

  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;
  const userId = parsedUser?.id;
  const userRole = parsedUser?.role;

  // ⬇️ Fetch profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/profile/?user_id=${userId}`);
        if (!response.ok) throw new Error('Failed to load profile');
        const result = await response.json();
        console.log(result);

        setProfile({
          fullName: result.data.full_name,
          email: result.data.email,
          username: result.data.username,
          phone: result.data.phone
        });

      } catch (error) {
        console.error(error);
        alert('Could not load profile');
      }
    };

    // const fetchMedicalHistory = async () => {
    //   try {
    //     const response = await fetch(`http://localhost:8000/api/medical-history/?user_id=${userId}`);
    //     if (!response.ok) throw new Error('Failed to load medical history');
    //     const result = await response.json();
    //     console.log(result);

    //     setMedicalHistory({
    //       conditions: result.data.conditions || "",
    //       medications: result.data.medications || "",
    //       allergies: result.data.allergies || ""
    //     });

    //   } catch (error) {
    //     console.error(error);
    //     alert('Could not load medical history');
    //   }
    // };

    if (userId) {
      fetchProfile();
      // if (userRole === 'mother') {
      //   fetchMedicalHistory();
      // }
    }
  }, [userId, userRole]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicalHistoryChange = (e) => {
    const { name, value } = e.target;
    setMedicalHistory(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/profile/?user_id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          phone: profile.phone
        })
      });
      if (!response.ok) throw new Error('Update failed');
      alert('Profile updated successfully');
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      alert("Passwords don't match");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/change-password/?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new
        })
      });
      if (!response.ok) throw new Error('Password change failed');
      alert('Password updated successfully');
      setPassword({ current: "", new: "", confirm: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMedicalHistorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/medical-history/?user_id=${userId}`, {
        method: 'PUT',  // or POST depending on your API design
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicalHistory)
      });
      if (!response.ok) throw new Error('Medical history update failed');
      alert('Medical history updated successfully');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Profile Settings */}
      <form onSubmit={handleProfileSubmit} className="rounded-lg bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
        <div className="space-y-2">
          <Input placeholder="Full Name" value={profile.fullName} readOnly />
          <Input placeholder="Email Address" value={profile.email} readOnly />
          <Input 
            placeholder="Username"
            name="username"
            value={profile.username}
            onChange={handleProfileChange}
          />
          <Input 
            placeholder="Phone"
            name="phone"
            value={profile.phone}
            onChange={handleProfileChange}
          />
          <Button type="submit" className="mt-2">Save Profile</Button>
        </div>
      </form>

      {/* Medical History (only for mothers) */}
      {userRole === 'mother' && (
        <form onSubmit={handleMedicalHistorySubmit} className="rounded-lg bg-white p-6 shadow-soft space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
          <div className="space-y-2">
            <Input 
              placeholder="Conditions (comma separated)"
              name="conditions"
              value={medicalHistory.conditions}
              onChange={handleMedicalHistoryChange}
            />
            <Input 
              placeholder="Medications (comma separated)"
              name="medications"
              value={medicalHistory.medications}
              onChange={handleMedicalHistoryChange}
            />
            <Input 
              placeholder="Allergies (comma separated)"
              name="allergies"
              value={medicalHistory.allergies}
              onChange={handleMedicalHistoryChange}
            />
            <Button type="submit" className="mt-2">Save Medical History</Button>
          </div>
        </form>
      )}

      {/* Password Change */}
      <form onSubmit={handlePasswordSubmit} className="rounded-lg bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <div className="space-y-2">
          <Input 
            type="password" 
            placeholder="Current Password" 
            name="current"
            value={password.current}
            onChange={handlePasswordChange}
            required
          />
          <Input 
            type="password" 
            placeholder="New Password" 
            name="new"
            value={password.new}
            onChange={handlePasswordChange}
            required
          />
          <Input 
            type="password" 
            placeholder="Confirm New Password" 
            name="confirm"
            value={password.confirm}
            onChange={handlePasswordChange}
            required
          />
          <Button type="submit" className="mt-2" variant="outline">
            Update Password
          </Button>
        </div>
      </form>

      {/* Notification Settings */}
      <div className="rounded-lg bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center justify-between">
          <span>Email Notifications</span>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span>SMS Alerts</span>
          <Switch />
        </div>
        <Button className="mt-2">Save Notifications</Button>
      </div>

      {/* System Preferences */}
      <div className="rounded-lg bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">System Preferences</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <span>Auto Update Reports</span>
            <Switch defaultChecked />
          </div>
          <Button className="mt-2">Save Preferences</Button>
        </div>
      </div>

    </div>
  );
}
