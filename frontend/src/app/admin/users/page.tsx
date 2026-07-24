'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  Users,
  Plus,
  X,
  Pencil,
  Trash2,
  ChevronLeft,
  Shield,
  ShieldCheck,
  Eye,
  User as UserIcon,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: 'root' | 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'viewer';
}

interface UpdateUserPayload {
  role?: 'admin' | 'user' | 'viewer';
  status?: 'active' | 'inactive';
}

// ── Config ───────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  root: 'bg-primary/15 text-primary border border-border',
  admin: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  user: 'bg-slate-500/15 text-text-secondary border border-slate-500/20',
  viewer: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
};

const ROLE_ICONS: Record<string, typeof Shield> = {
  root: ShieldCheck,
  admin: Shield,
  user: UserIcon,
  viewer: Eye,
};

const STATUS_STYLES: Record<string, string> = {
  active: 'badge-active',
  inactive: 'badge-inactive',
};

const AVAILABLE_ROLES = ['admin', 'user', 'viewer'] as const;

/**
 * Admin User Management page — accessible only by root users.
 * Provides CRUD operations for all non-root users.
 */
export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form state — Add
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'admin' | 'user' | 'viewer'>('user');
  const [addError, setAddError] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Form state — Edit
  const [editRole, setEditRole] = useState<'admin' | 'user' | 'viewer'>('user');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'root')) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  // ── Fetch users ─────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<UserRecord[]>('/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'root') {
      fetchUsers();
    }
  }, [authLoading, user]);

  // ── Add user ────────────────────────────────────────────────────
  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSubmitting(true);

    try {
      await api.post('/users', {
        name: addName.trim(),
        email: addEmail.trim(),
        password: addPassword,
        role: addRole,
      });
      setShowAddModal(false);
      resetAddForm();
      fetchUsers();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setAddSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setAddName('');
    setAddEmail('');
    setAddPassword('');
    setAddRole('user');
    setAddError('');
  };

  // ── Edit user ───────────────────────────────────────────────────
  const openEditModal = (u: UserRecord) => {
    setEditingUser(u);
    setEditRole(u.role === 'root' ? 'admin' : (u.role as 'admin' | 'user' | 'viewer'));
    setEditStatus(u.status);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');
    setEditSubmitting(true);

    try {
      const payload: UpdateUserPayload = {};
      if (editingUser.role !== 'root') payload.role = editRole;
      payload.status = editStatus;

      await api.patch(`/users/${editingUser.id}`, payload);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Deactivate user ─────────────────────────────────────────────
  const handleDeactivate = async (u: UserRecord) => {
    if (!confirm(`Deactivate user "${u.name}"? They will lose access to the system.`)) return;

    try {
      await api.delete(`/users/${u.id}`);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  // ── Format date ─────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ── Role badge ──────────────────────────────────────────────────
  const RoleBadge = ({ role }: { role: UserRecord['role'] }) => {
    const Icon = ROLE_ICONS[role] || UserIcon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          ROLE_STYLES[role] || ROLE_STYLES.user
        }`}
      >
        <Icon className="h-3 w-3" />
        {role}
      </span>
    );
  };

  // ── Loading state ───────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Auth guard (prevent flash) ──────────────────────────────────
  if (!user || user.role !== 'root') {
    return null;
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="mb-2 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/25">
                <Users className="h-5 w-5 text-text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">User Management</h1>
                <p className="text-sm text-text-secondary">
                  Manage users and roles in your ERP instance
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              resetAddForm();
              setShowAddModal(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-6 rounded-lg border border-red-500/30 bg-red-900/30 p-3 text-sm text-danger"
            role="alert"
          >
            {error}
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-2 text-danger underline hover:text-danger"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="card overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <div className="h-5 w-40 animate-pulse rounded bg-surface-hover" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
                  <div className="h-4 w-40 animate-pulse rounded bg-surface-hover" />
                  <div className="h-5 w-16 animate-pulse rounded bg-surface-hover" />
                  <div className="h-5 w-16 animate-pulse rounded bg-surface-hover" />
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-surface-hover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users table */}
        {!loading && (
          <div className="card overflow-hidden">
            {users.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Users className="mx-auto h-10 w-10 text-text-muted" />
                <p className="mt-3 text-sm text-text-secondary">
                  No users found. Add your first user to get started.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-3 font-medium text-primary">Name</th>
                    <th className="px-6 py-3 font-medium text-primary">Email</th>
                    <th className="px-6 py-3 font-medium text-primary">Role</th>
                    <th className="px-6 py-3 font-medium text-primary">Status</th>
                    <th className="px-6 py-3 font-medium text-primary">Created</th>
                    <th className="px-6 py-3 text-right font-medium text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_STYLES[u.status] || 'badge-active'
                          }`}
                        >
                          {u.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role === 'root' ? (
                          <span className="text-xs text-text-muted">
                            — no actions —
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
                              aria-label={`Edit ${u.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeactivate(u)}
                              className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-red-500/10 hover:text-danger"
                              aria-label={`Deactivate ${u.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── Add User Modal ───────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card w-full max-w-md rounded-xl p-6 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Add User</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              {addError && (
                <div
                  className="rounded-lg border border-red-500/30 bg-red-900/30 p-3 text-sm text-danger"
                  role="alert"
                >
                  {addError}
                </div>
              )}

              <div>
                <label
                  htmlFor="add-name"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Full Name
                </label>
                <input
                  id="add-name"
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label
                  htmlFor="add-email"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Email
                </label>
                <input
                  id="add-email"
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="add-password"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Password
                </label>
                <input
                  id="add-password"
                  type="password"
                  required
                  minLength={6}
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="add-role"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Role
                </label>
                <select
                  id="add-role"
                  value={addRole}
                  onChange={(e) =>
                    setAddRole(e.target.value as 'admin' | 'user' | 'viewer')
                  }
                  className="w-full appearance-none bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {addSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating&hellip;
                    </span>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ──────────────────────────────────────── */}
      {showEditModal && editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
        >
          <div
            className="card w-full max-w-md rounded-xl p-6 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                Edit User
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-border bg-surface-card p-3">
              <p className="text-sm font-medium text-text-primary">{editingUser.name}</p>
              <p className="text-xs text-text-secondary">{editingUser.email}</p>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              {editError && (
                <div
                  className="rounded-lg border border-red-500/30 bg-red-900/30 p-3 text-sm text-danger"
                  role="alert"
                >
                  {editError}
                </div>
              )}

              <div>
                <label
                  htmlFor="edit-role"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Role
                </label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) =>
                    setEditRole(e.target.value as 'admin' | 'user' | 'viewer')
                  }
                  className="w-full appearance-none bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-status"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as 'active' | 'inactive')
                  }
                  className="w-full appearance-none bg-surface-card border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="btn-outline px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {editSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving&hellip;
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
