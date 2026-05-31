'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SiteSettings } from '@/lib/types';
import { saveSettings } from '@/app/actions/settings';

interface SettingsManagementProps {
  settings: SiteSettings | null;
}

export default function SettingsManagement({ settings }: SettingsManagementProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const res = await saveSettings(formData);
      if (res.success) {
        setSuccess('Đã lưu thông tin cài đặt website thành công!');
        router.refresh();
      } else {
        setError(res.error || 'Có lỗi xảy ra khi lưu cài đặt');
      }
    });
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Cài đặt website</h1>
        <p className="admin-page-subtitle">Cấu hình thông tin liên hệ, hotline, slogan và các mạng xã hội của nhà xe</p>
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

      <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {settings && (
            <input type="hidden" name="setting_id" value={settings.setting_id} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại Hotline <span className="required">*</span></label>
              <input
                type="text"
                name="hotline"
                className="form-input"
                defaultValue={settings?.hotline || ''}
                placeholder="Ví dụ: 0905 123 456"
                required
                disabled={isPending}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại Zalo <span className="required">*</span></label>
              <input
                type="text"
                name="zalo_phone"
                className="form-input"
                defaultValue={settings?.zalo_phone || ''}
                placeholder="Ví dụ: 0905 123 456"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ văn phòng chính <span className="required">*</span></label>
            <input
              type="text"
              name="office_address"
              className="form-input"
              defaultValue={settings?.office_address || ''}
              placeholder="Nhập địa chỉ đầy đủ của văn phòng"
              required
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thời gian làm việc <span className="required">*</span></label>
            <input
              type="text"
              name="working_hours"
              className="form-input"
              defaultValue={settings?.working_hours || ''}
              placeholder="Ví dụ: 5:00 - 22:00 hàng ngày"
              required
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slogan Quảng cáo (Banner chính) <span className="required">*</span></label>
            <textarea
              name="banner_slogan"
              className="form-textarea"
              defaultValue={settings?.banner_slogan || ''}
              placeholder="Ví dụ: Đồng hành cùng bạn trên mọi chuyến đi"
              rows={2}
              required
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Đường dẫn trang Facebook (Facebook URL)</label>
            <input
              type="url"
              name="facebook_url"
              className="form-input"
              defaultValue={settings?.facebook_url || ''}
              placeholder="https://facebook.com/nhaxeduyhung"
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Đường dẫn Zalo OA (Zalo Official Account URL)</label>
            <input
              type="text"
              name="zalo_oa_url"
              className="form-input"
              defaultValue={settings?.zalo_oa_url || ''}
              placeholder="https://zalo.me/..."
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ alignSelf: 'flex-start', minWidth: '200px', marginTop: '10px' }}
            disabled={isPending}
          >
            {isPending ? 'Đang lưu cài đặt...' : '💾 Lưu cài đặt'}
          </button>
        </form>
      </div>
    </div>
  );
}
