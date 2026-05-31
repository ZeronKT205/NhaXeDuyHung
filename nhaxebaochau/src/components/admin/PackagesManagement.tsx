'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PackageWithDetails, Vehicle, Route } from '@/lib/types';
import { formatPrice, getPackageTypeLabel } from '@/lib/utils';
import { savePackage, deletePackage } from '@/app/actions/package';

interface PackagesManagementProps {
  packages: PackageWithDetails[];
  vehicles: Vehicle[];
  routes: Route[];
}

export default function PackagesManagement({
  packages,
  vehicles,
  routes,
}: PackagesManagementProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenAdd = () => {
    setSelectedPackage(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: PackageWithDetails) => {
    setSelectedPackage(pkg);
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
      const res = await savePackage(formData);
      if (res.success) {
        setSuccess(selectedPackage ? 'Đã cập nhật gói dịch vụ thành công!' : 'Đã thêm gói dịch vụ mới thành công!');
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
    if (!confirm('Bạn có chắc chắn muốn xoá gói dịch vụ này? Thao tác này sẽ ẩn gói khỏi bảng giá Landing Page.')) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await deletePackage(id);
      if (res.success) {
        setSuccess('Đã xoá gói dịch vụ thành công!');
        router.refresh();
      } else {
        setError(res.error || 'Có lỗi xảy ra khi xoá gói dịch vụ');
      }
    });
  };

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-page-title">Quản lý gói dịch vụ & Giá</h1>
          <p className="admin-page-subtitle">Quản lý giá vé ghép và bao xe cho từng loại xe và tuyến đường</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={handleOpenAdd}>
          ➕ Thêm gói mới
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
              <th>Tuyến đường</th>
              <th>Phương tiện</th>
              <th>Loại gói</th>
              <th>Đơn giá (VND)</th>
              <th>Mô tả thêm</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Chưa có gói dịch vụ nào. Bấm "Thêm gói mới" để tạo.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => {
                const routeText = pkg.routes
                  ? `${pkg.routes.departure_point} → ${pkg.routes.destination_point}`
                  : 'Đang tải...';
                return (
                  <tr key={pkg.package_id} style={{ cursor: 'default' }}>
                    <td>
                      <strong>📍 {routeText}</strong>
                    </td>
                    <td>{pkg.vehicles?.vehicle_name || 'Đang tải...'} ({pkg.vehicles?.vehicle_type || '—'})</td>
                    <td>
                      <span className={`badge badge-${pkg.package_type}`}>
                        {getPackageTypeLabel(pkg.package_type)}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-600)' }}>{formatPrice(pkg.price)}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        /{pkg.package_type === 'shared' ? 'khách' : 'chuyến'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{pkg.description || '—'}</td>
                    <td>
                      <span className={`badge ${pkg.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {pkg.is_active ? '🟢 Hiển thị' : '🔴 Ẩn'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(pkg)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(pkg.package_id)}>
                          🗑️ Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2>{selectedPackage ? 'Cập nhật gói dịch vụ' : 'Thêm gói dịch vụ mới'}</h2>
                <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedPackage && (
                  <input type="hidden" name="package_id" value={selectedPackage.package_id} />
                )}

                <div className="form-group">
                  <label className="form-label">Tuyến đường <span className="required">*</span></label>
                  <select
                    name="route_id"
                    className="form-select"
                    defaultValue={selectedPackage?.route_id || ''}
                    required
                    disabled={isPending}
                  >
                    <option value="">-- Chọn tuyến đường --</option>
                    {routes.map((route) => (
                      <option key={route.route_id} value={route.route_id}>
                        📍 {route.departure_point} → {route.destination_point} {route.distance_km ? `(${route.distance_km}km)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Chọn xe <span className="required">*</span></label>
                  <select
                    name="vehicle_id"
                    className="form-select"
                    defaultValue={selectedPackage?.vehicle_id || ''}
                    required
                    disabled={isPending}
                  >
                    <option value="">-- Chọn loại xe --</option>
                    {vehicles.map((v) => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        🚐 {v.vehicle_name} ({v.vehicle_type} - {v.seat_count} chỗ)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phân loại gói xe <span className="required">*</span></label>
                  <select
                    name="package_type"
                    className="form-select"
                    defaultValue={selectedPackage?.package_type || 'shared'}
                    required
                    disabled={isPending}
                  >
                    <option value="shared">Xe ghép (Shared - Tính giá theo người)</option>
                    <option value="private">Bao xe nguyên chuyến (Private - Tính giá theo xe)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Đơn giá vé (VND) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    defaultValue={selectedPackage?.price || ''}
                    placeholder="Nhập giá tiền bằng VND"
                    required
                    min={0}
                    disabled={isPending}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả thêm (phụ thu, ghi chú phụ phí...)</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    defaultValue={selectedPackage?.description || ''}
                    placeholder="Ví dụ: Giá đã bao gồm phí cầu đường, phụ thu thêm 50k nếu đón ngoài phạm vi 10km..."
                    rows={2}
                    disabled={isPending}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái hoạt động</label>
                  <select
                    name="is_active"
                    className="form-select"
                    defaultValue={selectedPackage ? String(selectedPackage.is_active) : 'true'}
                    disabled={isPending}
                  >
                    <option value="true">Hiển thị trên Landing Page</option>
                    <option value="false">Tạm ẩn</option>
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
