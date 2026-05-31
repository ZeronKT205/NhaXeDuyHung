'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';
import { saveVehicle, deleteVehicle } from '@/app/actions/vehicle';

interface VehiclesManagementProps {
  vehicles: Vehicle[];
}

export default function VehiclesManagement({ vehicles }: VehiclesManagementProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenAdd = () => {
    setSelectedVehicle(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
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
      const res = await saveVehicle(formData);
      if (res.success) {
        setSuccess(selectedVehicle ? 'Đã cập nhật thông tin xe thành công!' : 'Đã thêm xe mới thành công!');
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
    if (!confirm('Bạn có chắc chắn muốn xoá xe này? Thao tác này sẽ ẩn xe khỏi website.')) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await deleteVehicle(id);
      if (res.success) {
        setSuccess('Đã xoá xe thành công!');
        router.refresh();
      } else {
        setError(res.error || 'Có lỗi xảy ra khi xoá xe');
      }
    });
  };

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-page-title">Quản lý đội xe</h1>
          <p className="admin-page-subtitle">Thêm mới và cập nhật thông tin đội xe của nhà xe</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={handleOpenAdd}>
          ➕ Thêm xe mới
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
              <th>Hình ảnh</th>
              <th>Tên xe</th>
              <th>Loại xe</th>
              <th>Số chỗ ngồi</th>
              <th>Biển số xe</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Chưa có xe nào. Bấm "Thêm xe mới" để tạo.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.vehicle_id} style={{ cursor: 'default' }}>
                  <td>
                    <div style={{ width: '60px', height: '40px', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {vehicle.image_url ? (
                        <img src={vehicle.image_url} alt={vehicle.vehicle_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        '🚐'
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{vehicle.vehicle_name}</strong>
                  </td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.seat_count} chỗ</td>
                  <td>{vehicle.license_plate || '—'}</td>
                  <td>
                    <span className={`badge ${vehicle.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {vehicle.is_active ? '🟢 Đang hoạt động' : '🔴 Ngừng hoạt động'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(vehicle)}>
                        ✏️ Sửa
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vehicle.vehicle_id)}>
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
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2>{selectedVehicle ? 'Cập nhật thông tin xe' : 'Thêm xe mới'}</h2>
                <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedVehicle && (
                  <input type="hidden" name="vehicle_id" value={selectedVehicle.vehicle_id} />
                )}

                <div className="form-group">
                  <label className="form-label">Tên xe <span className="required">*</span></label>
                  <input
                    type="text"
                    name="vehicle_name"
                    className="form-input"
                    defaultValue={selectedVehicle?.vehicle_name || ''}
                    placeholder="Ví dụ: Xe Limousine Vip A"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loại xe <span className="required">*</span></label>
                  <input
                    type="text"
                    name="vehicle_type"
                    className="form-input"
                    defaultValue={selectedVehicle?.vehicle_type || ''}
                    placeholder="Ví dụ: Limousine, SUV, Sedan"
                    required
                    disabled={isPending}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Số chỗ ngồi <span className="required">*</span></label>
                    <input
                      type="number"
                      name="seat_count"
                      className="form-input"
                      defaultValue={selectedVehicle?.seat_count || 9}
                      min={1}
                      required
                      disabled={isPending}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Biển số xe</label>
                    <input
                      type="text"
                      name="license_plate"
                      className="form-input"
                      defaultValue={selectedVehicle?.license_plate || ''}
                      placeholder="Ví dụ: 75A-123.45"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Đường dẫn ảnh xe (URL)</label>
                  <input
                    type="text"
                    name="image_url"
                    className="form-input"
                    defaultValue={selectedVehicle?.image_url || ''}
                    placeholder="https://example.com/image.jpg"
                    disabled={isPending}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả tiện ích xe</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    defaultValue={selectedVehicle?.description || ''}
                    placeholder="Ví dụ: Ghế massage, wifi tốc độ cao, nước uống miễn phí..."
                    rows={3}
                    disabled={isPending}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái hoạt động</label>
                  <select
                    name="is_active"
                    className="form-select"
                    defaultValue={selectedVehicle ? String(selectedVehicle.is_active) : 'true'}
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
