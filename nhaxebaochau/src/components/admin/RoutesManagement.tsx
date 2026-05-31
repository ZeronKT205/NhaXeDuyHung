'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from '@/lib/types';
import { saveRoute, deleteRoute } from '@/app/actions/routes';


interface RoutesManagementProps {
  routes: Route[];
}

export default function RoutesManagement({ routes }: RoutesManagementProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenAdd = () => {
    setSelectedRoute(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: Route) => {
    setSelectedRoute(route);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const res = await saveRoute(formData);
      if (res.success) {
        setSuccess(selectedRoute ? 'Đã cập nhật tuyến đường thành công!' : 'Đã thêm tuyến đường mới thành công!');
        router.refresh();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1000);
      } else {
        setError(res.error || 'Có lỗi xảy ra');
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xoá tuyến đường này? Thao tác này sẽ ẩn các gói giá liên quan.')) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await deleteRoute(id);
      if (res.success) {
        setSuccess('Đã xoá tuyến đường thành công!');
        router.refresh();
      } else {
        setError(res.error || 'Có lỗi xảy ra khi xoá tuyến đường');
      }
    });
  };

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-page-title">Quản lý tuyến đường</h1>
          <p className="admin-page-subtitle">Quản lý các điểm đi, điểm đến và cự ly di chuyển liên tỉnh</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={handleOpenAdd}>
          ➕ Thêm tuyến đường mới
        </button>
      </div>

      {success && (
        <div className="login-error" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'var(--success-500)', color: '#86efac', marginBottom: '20px' }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="login-error" style={{ marginBottom: '20px' }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className="table-wrapper" style={{ background: 'white' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Điểm xuất phát</th>
              <th>Điểm đến</th>
              <th>Quãng đường (km)</th>
              <th>Thời gian ước tính</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Chưa có tuyến đường nào. Bấm "Thêm tuyến đường" để tạo.
                </td>
              </tr>
            ) : (
              routes.map((route) => (
                <tr key={route.route_id} style={{ cursor: 'default' }}>
                  <td>
                    <strong>📍 {route.departure_point}</strong>
                  </td>
                  <td>
                    <strong>🏁 {route.destination_point}</strong>
                  </td>
                  <td>{route.distance_km ? `${route.distance_km} km` : '—'}</td>
                  <td>{route.estimated_duration || '—'}</td>
                  <td>
                    <span className={`badge ${route.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {route.is_active ? '🟢 Đang hoạt động' : '🔴 Ngừng hoạt động'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(route)}>
                        ✏️ Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(route.route_id)}>
                        🗑️ Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2>{selectedRoute ? 'Cập nhật tuyến đường' : 'Thêm tuyến đường mới'}</h2>
                <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedRoute && (
                  <input type="hidden" name="route_id" value={selectedRoute.route_id} />
                )}

                <div className="form-group">
                  <label className="form-label">Điểm xuất phát <span className="required">*</span></label>
                  <input
                    type="text"
                    name="departure_point"
                    className="form-input"
                    defaultValue={selectedRoute?.departure_point || ''}
                    placeholder="Ví dụ: Huế"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Điểm đến <span className="required">*</span></label>
                  <input
                    type="text"
                    name="destination_point"
                    className="form-input"
                    defaultValue={selectedRoute?.destination_point || ''}
                    placeholder="Ví dụ: Đà Nẵng"
                    required
                    disabled={isPending}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Khoảng cách (km)</label>
                    <input
                      type="number"
                      name="distance_km"
                      className="form-input"
                      defaultValue={selectedRoute?.distance_km || ''}
                      placeholder="Ví dụ: 100"
                      min={0}
                      step="any"
                      disabled={isPending}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thời gian ước tính</label>
                    <input
                      type="text"
                      name="estimated_duration"
                      className="form-input"
                      defaultValue={selectedRoute?.estimated_duration || ''}
                      placeholder="Ví dụ: 2 giờ 30 phút"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái hoạt động</label>
                  <select
                    name="is_active"
                    className="form-select"
                    defaultValue={selectedRoute ? String(selectedRoute.is_active) : 'true'}
                    disabled={isPending}
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                  Huỷ
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                  {isPending ? 'Đang lưu...' : '💾 Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
