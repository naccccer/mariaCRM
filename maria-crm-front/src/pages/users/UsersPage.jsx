import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { useCreateUser, useUpdateUser, useUsers } from '../../hooks/useCrmApi';
import { labelFromMap, roleCodeLabels } from '../../lib/constants';
import { formatDate } from '../../lib/formatters';

function normalizeRoleIds(roles, roleCodes = []) {
  return roles
    .filter((role) => roleCodes.includes(role.code))
    .map((role) => String(role.id));
}

export default function UsersPage() {
  const usersQuery = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: '',
    is_active: true,
    role_ids: [],
  });

  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    password: '',
    is_active: true,
    role_ids: [],
  });

  if (usersQuery.isLoading) {
    return <LoadingState message="در حال دریافت کاربران..." />;
  }

  if (usersQuery.error) {
    return <ErrorState message={usersQuery.error.message} onRetry={usersQuery.refetch} />;
  }

  const users = usersQuery.data?.users || [];
  const roles = usersQuery.data?.roles || [];

  function getRoleLabel(roleCode, fallback = '') {
    const translated = labelFromMap(roleCodeLabels, roleCode);
    return translated === roleCode ? fallback || roleCode : translated;
  }

  function toggleRole(roleId, mode) {
    const formSetter = mode === 'create' ? setCreateForm : setEditForm;

    formSetter((prev) => {
      const current = prev.role_ids;
      const exists = current.includes(String(roleId));
      const next = exists
        ? current.filter((item) => item !== String(roleId))
        : [...current, String(roleId)];

      return { ...prev, role_ids: next };
    });
  }

  async function submitCreate(event) {
    event.preventDefault();

    await createUserMutation.mutateAsync({
      ...createForm,
      role_ids: createForm.role_ids.map(Number),
      is_active: Boolean(createForm.is_active),
    });

    setCreateModalOpen(false);
    setCreateForm({ full_name: '', email: '', password: '', is_active: true, role_ids: [] });
  }

  function openEdit(user) {
    setEditingUserId(user.id);
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      password: '',
      is_active: user.is_active,
      role_ids: normalizeRoleIds(roles, user.role_codes),
    });
    setEditModalOpen(true);
  }

  async function submitEdit(event) {
    event.preventDefault();

    if (!editingUserId) {
      return;
    }

    const payload = {
      full_name: editForm.full_name,
      email: editForm.email,
      is_active: Boolean(editForm.is_active),
      role_ids: editForm.role_ids.map(Number),
    };

    if (editForm.password) {
      payload.password = editForm.password;
    }

    await updateUserMutation.mutateAsync({
      id: editingUserId,
      payload,
    });

    setEditModalOpen(false);
    setEditingUserId(null);
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="toolbar-wrap">
          <div>
            <h2>کاربران و نقش‌ها</h2>
            <p className="muted">مدیریت دسترسی‌ها فقط برای مدیر سیستم فعال است.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            کاربر جدید
          </button>
        </div>

        {users.length === 0 ? (
          <EmptyState message="کاربری ثبت نشده است." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>نام</th>
                  <th>ایمیل</th>
                  <th>نقش‌ها</th>
                  <th>وضعیت</th>
                  <th>تاریخ ثبت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="chip-list">
                        {user.role_codes.length > 0
                          ? user.role_codes.map((roleCode) => (
                              <Badge key={roleCode}>{getRoleLabel(roleCode)}</Badge>
                            ))
                          : '---'}
                      </div>
                    </td>
                    <td>
                      <Badge tone={user.is_active ? 'success' : 'danger'}>
                        {user.is_active ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <button type="button" className="btn btn-light" onClick={() => openEdit(user)}>
                        ویرایش
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="ثبت کاربر جدید" size="lg">
        <form className="form-grid" onSubmit={submitCreate}>
          <label>
            <span>نام کامل</span>
            <input
              value={createForm.full_name}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, full_name: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>رمز عبور</span>
            <input
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={createForm.is_active}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, is_active: event.target.checked }))}
            />
            <span>کاربر فعال باشد</span>
          </label>

          <div className="role-picker">
            <span>نقش‌ها</span>
            <div className="role-grid">
              {roles.map((role) => (
                <label key={role.id} className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={createForm.role_ids.includes(String(role.id))}
                    onChange={() => toggleRole(role.id, 'create')}
                  />
                  <span>{getRoleLabel(role.code, role.name)}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={createUserMutation.isPending}>
            {createUserMutation.isPending ? 'در حال ثبت...' : 'ثبت کاربر'}
          </button>
        </form>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="ویرایش کاربر" size="lg">
        <form className="form-grid" onSubmit={submitEdit}>
          <label>
            <span>نام کامل</span>
            <input
              value={editForm.full_name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, full_name: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={editForm.email}
              onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>رمز عبور جدید (اختیاری)</span>
            <input
              type="password"
              value={editForm.password}
              onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={editForm.is_active}
              onChange={(event) => setEditForm((prev) => ({ ...prev, is_active: event.target.checked }))}
            />
            <span>کاربر فعال باشد</span>
          </label>

          <div className="role-picker">
            <span>نقش‌ها</span>
            <div className="role-grid">
              {roles.map((role) => (
                <label key={role.id} className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={editForm.role_ids.includes(String(role.id))}
                    onChange={() => toggleRole(role.id, 'edit')}
                  />
                  <span>{getRoleLabel(role.code, role.name)}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={updateUserMutation.isPending}>
            {updateUserMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
