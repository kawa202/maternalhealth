import React from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/switch';

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>

      {/* Profile Settings */}
      <div className="rounded-lg bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
        <div className="space-y-2">
          <Input placeholder="Full Name" defaultValue="Admin User" />
          <Input placeholder="Email Address" defaultValue="admin@example.com" />
          <Button className="mt-2">Save Profile</Button>
        </div>
      </div>

      {/* Password Change */}
      <div className="rounded-lg bg-white p-6 shadow-soft space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <div className="space-y-2">
          <Input type="password" placeholder="Current Password" />
          <Input type="password" placeholder="New Password" />
          <Input type="password" placeholder="Confirm New Password" />
          <Button className="mt-2" variant="outline">Update Password</Button>
        </div>
      </div>

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