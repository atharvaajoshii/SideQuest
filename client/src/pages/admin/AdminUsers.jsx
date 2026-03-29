import React from 'react';
import { Link, Shield, Ban, Search } from 'lucide-react';

export default function AdminUsers() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@college.edu', role: 'user', status: 'Active' },
    { id: 2, name: 'Sarah Jenkins', email: 'sarah@college.edu', role: 'admin', status: 'Active' },
    { id: 3, name: 'Mike Smith', email: 'mike@college.edu', role: 'user', status: 'Suspended' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Manage Users</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none" />
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600">Name</th>
                <th className="p-4 font-bold text-slate-600">Email</th>
                <th className="p-4 font-bold text-slate-600">Role</th>
                <th className="p-4 font-bold text-slate-600">Status</th>
                <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <Link to={`/freelancer/${user.id}`} className="font-bold text-slate-900 hover:text-primary transition">
                      {user.name}
                    </Link>
                  </td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="flex items-center gap-1 text-primary font-bold text-xs bg-indigo-50 px-2 py-1 rounded-full w-max"><Shield size={14} /> Admin</span>
                    ) : (
                      <span className="text-slate-500 text-sm">User</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    <button className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-sm font-bold">
                      <Ban size={16} /> Suspend
                    </button>
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