import type { SiteSettings } from '@/lib/types';

interface FooterProps {
  settings: SiteSettings | null;
}

const HOTLINE  = '0335-232-346';
const ZALO_URL = 'https://zalo.me/0335232346';
const FB_URL   = 'https://www.facebook.com/profile.php?id=61585870280308';

export default function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear();

  const hotline = HOTLINE;
  const zalo    = HOTLINE;
  const zaloUrl = ZALO_URL;
  const fbUrl   = FB_URL;
  const hours   = settings?.working_hours || '5:00 – 22:00 hàng ngày';

  return (
    <footer className="landing-footer" id="footer">
      <div className="container">

        <div className="footer-main">

          {/* ── LEFT: Brand ── */}
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <img
                src="/image/Herosecsison/logo_cropped_no_shadow.png"
                alt="Nhà Xe Duy Hùng"
                className="footer-logo-img"
              />
            </div>
            <p className="footer-tagline">
              Dịch vụ xe ghép liên tỉnh uy tín tuyến<br />
              Huế – Đà Nẵng – Hội An.<br />
              Đón tận nhà, đúng giờ, giá rõ ràng.
            </p>
            <div className="footer-social-row">
              <a href={fbUrl} className="footer-social-btn footer-social-btn--fb"
                 target="_blank" rel="noopener noreferrer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
              <a href={zaloUrl} className="footer-social-btn footer-social-btn--zalo"
                 target="_blank" rel="noopener noreferrer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Zalo
              </a>
            </div>
          </div>

          {/* ── RIGHT: Top info + Story below ── */}
          <div className="footer-right">

            {/* Top row: Contact + Links */}
            <div className="footer-info-row">
              <div>
                <h4 className="footer-col-title">Liên hệ</h4>
                <ul className="footer-contact-list">
                  <li className="footer-contact-item">
                    <span className="footer-contact-key">Hotline</span>
                    <a href={`tel:${hotline.replace(/\s/g, '')}`} className="footer-contact-val footer-contact-link">
                      {hotline}
                    </a>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-key">Zalo</span>
                    <a href={zaloUrl} className="footer-contact-val footer-contact-link"
                       target="_blank" rel="noopener noreferrer">
                      {zalo}
                    </a>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-key">Giờ mở cửa</span>
                    <span className="footer-contact-val">{hours}</span>
                  </li>
                </ul>
              </div>

              <div className="footer-links-row">
                <div>
                  <h4 className="footer-col-title">Tuyến đường</h4>
                  <ul className="footer-link-list">
                    {['Huế → Đà Nẵng', 'Huế → Hội An', 'Đà Nẵng → Hội An'].map(r => (
                      <li key={r}><a href="#routes" className="footer-link">{r}</a></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="footer-col-title">Dịch vụ</h4>
                  <ul className="footer-link-list">
                    {['Xe ghép liên tỉnh', 'Xe riêng theo yêu cầu', 'Đón sân bay', 'Du lịch nhóm'].map(s => (
                      <li key={s}><a href="#booking" className="footer-link">{s}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Story — spans full width of right column */}
            <div className="footer-story">
              <p className="footer-story-text">
                Hơn 10 năm trước, tôi bắt đầu với một chiếc xe cũ mượn của người quen và hai bàn tay trắng.
                Không vốn, không mối, chỉ có điện thoại và cái tâm muốn đưa người ta đến nơi an toàn.
                Có những đêm ngồi trước hiên nhà đếm từng chuyến, lo không biết tháng này có đủ tiền mua gạo không.
                Nhiều lần tự hỏi có nên bỏ nghề — nhưng mỗi lần thấy khách xuống xe mỉm cười cảm ơn, lại không thể.
              </p>
              <p className="footer-story-text">
                Nhà Xe Duy Hùng không phải công ty lớn. Đó là mồ hôi, là những đêm thức trắng trên đường dài,
                là niềm tin rằng chỉ cần làm đúng, làm tốt, tử tế với từng khách — rồi mọi thứ sẽ đến đúng lúc.
                Đến hôm nay, dù còn nhỏ,{' '}
                <strong>Nhà Xe Duy Hùng chính là đứa con tinh thần tôi gầy dựng từ con số không.</strong>
              </p>
              <p className="footer-story-sig">
                Nếu bạn đang đọc những dòng này — cảm ơn bạn đã ghé qua.
                Tôi mong một ngày được đưa bạn đến nơi bạn muốn tới.
              </p>
            </div>

          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="footer-bottom">
          <span>© {year} Nhà Xe Duy Hùng. All rights reserved.</span>
          <span className="footer-bottom-right">An toàn · Uy tín · Chất lượng</span>
        </div>
      </div>
    </footer>
  );
}
