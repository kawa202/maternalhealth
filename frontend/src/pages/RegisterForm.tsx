import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['mother', 'provider']), // adjust if needed
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/register/', data);
      console.log('Registration successful:', response.data);
      alert('Registration successful!');
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      alert('Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">First Name</label>
          <input {...register('first_name')} className="w-full border rounded px-3 py-2" />
          {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Last Name</label>
          <input {...register('last_name')} className="w-full border rounded px-3 py-2" />
          {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Username</label>
          <input {...register('username')} className="w-full border rounded px-3 py-2" />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input {...register('email')} type="email" className="w-full border rounded px-3 py-2" />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Password</label>
          <input {...register('password')} type="password" className="w-full border rounded px-3 py-2" />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Phone</label>
          <input {...register('phone')} className="w-full border rounded px-3 py-2" />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Role</label>
          <select {...register('role')} className="w-full border rounded px-3 py-2">
            <option value="">Select role</option>
            <option value="mother">Mother</option>
            <option value="provider">Provider</option>
          </select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
