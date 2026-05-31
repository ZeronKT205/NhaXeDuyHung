import { getTranslations } from 'next-intl/server';

const MIXED_TESTIMONIALS = [
  { name: "Nguyễn Thanh Hà", location: "Huế", flag: "🇻🇳", text: "Đặt xe lúc 10 giờ tối, 15 phút sau có người xác nhận. Sáng hôm sau tài xế đến đúng giờ, xe sạch sẽ. Đi từ Huế vào Đà Nẵng rất thoải mái." },
  { name: "Sarah Jenkins", location: "USA", flag: "🇺🇸", text: "Excellent service! The limousine was clean and extremely comfortable. The driver helped with my heavy bags and spoke good English. 10/10!" },
  { name: "佐藤 健太", location: "Japan", flag: "🇯🇵", text: "フエからダナンまで利用しました。時間通りに迎えに来てくれて、運転も非常に丁寧でした。車内Wi-Fiも快適に使えました。" },
  { name: "김민지", location: "South Korea", flag: "🇰🇷", text: "다낭에서 호이안 갈 때 이용했는데 완전 대만족입니다! 차도 깨끗하고 기사님도 친절하셨어요. 가격도 착해서 다음에도 꼭 이용할 예정입니다." },
  { name: "Trần Minh Khoa", location: "Đà Nẵng", flag: "🇻🇳", text: "Đã dùng dịch vụ 3 lần, lần nào cũng đúng giờ. Giá đúng như báo, không bị tính thêm gì cả. Sẽ tiếp tục ủng hộ." },
  { name: "David Miller", location: "Australia", flag: "🇦🇺", text: "Very reliable intercity car service. No stress, straight door-to-door drop off. Much better and faster than taking the train." },
  { name: "鈴木 美咲", location: "Japan", flag: "🇯🇵", text: "朝早い便でダナン空港に行くために予約しましたが、早朝にもかかわらず時間厳守で安心しました。サービスが素晴らしいです。" },
  { name: "박준우", location: "South Korea", flag: "🇰🇷", text: "리무진 시트가 정말 편안해서 마사지 의자에 앉아가는 기분이었어요. 와이파이 잘 터지고 에어컨 빵빵합니다." },
  { name: "Lê Thị Bích Ngọc", location: "Hội An", flag: "🇻🇳", text: "Ra sân bay Đà Nẵng lúc 5 giờ sáng, tài xế vẫn đến đúng giờ. Cảm ơn nhà xe đã chu đáo." },
  { name: "Phạm Hoàng Nam", location: "Đà Nẵng", flag: "🇻🇳", text: "Xe đi cực êm, tài xế nói chuyện lịch sự, chạy xe rất điềm đạm, không phóng nhanh vượt ẩu. Rất hài lòng." },
  { name: "Elena Rostova", location: "Russia", flag: "🇷🇺", text: "Friendly booking staff, fast reply on Zalo. The private car was clean and spacious. Highly recommended for travelers." },
  { name: "한지원", location: "South Korea", flag: "🇰🇷", text: "후e에서 광빈으로 가는데 정말 좋은 기사님을 만났어요. 무거운 캐리어도 다 들어주시고 에어컨도 시원해서 쾌적한 여행이었습니다." },
  { name: "中村 拓海", location: "Japan", flag: "🇯🇵", text: "急な予定変更にも親切に対応していただき、本当に助かりました。またベトナムに来た際は必ず利用します。" },
  { name: "Hoàng Thu Thảo", location: "Huế", flag: "🇻🇳", text: "Nhà xe phục vụ rất chuyên nghiệp. Tôi thường xuyên đi chặng Huế - Đà Nẵng bằng xe ghép ở đây. Rất an tâm." }
];

export default async function Testimonials() {
  const t = await getTranslations('testimonials');

  const row1 = MIXED_TESTIMONIALS.slice(0, 7);
  const row2 = MIXED_TESTIMONIALS.slice(7, 14);

  return (
    <section className="section testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-header" style={{ marginBottom: 48 }}>
          <span className="section-label">{t('label')}</span>
          <div className="section-title-row">
            <h2 className="section-title">{t('title')}</h2>
          </div>
        </div>
      </div>

      <div className="testimonials-marquee-container">
        {/* Row 1: Scrolling Left */}
        <div className="marquee-wrapper">
          <div className="marquee-content marquee-left">
            <div className="marquee-track">
              {row1.map((r, i) => (
                <div key={i} className="testimonial-card">
                  <p className="testimonial-text">{r.text}</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="marquee-track" aria-hidden="true">
              {row1.map((r, i) => (
                <div key={`dup1-${i}`} className="testimonial-card">
                  <p className="testimonial-text">{r.text}</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="marquee-wrapper" style={{ marginTop: '24px' }}>
          <div className="marquee-content marquee-right">
            <div className="marquee-track">
              {row2.map((r, i) => (
                <div key={i} className="testimonial-card">
                  <p className="testimonial-text">{r.text}</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="marquee-track" aria-hidden="true">
              {row2.map((r, i) => (
                <div key={`dup2-${i}`} className="testimonial-card">
                  <p className="testimonial-text">{r.text}</p>
                  <div className="testimonial-author">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{r.flag}</span>
                      <span className="testimonial-name">{r.name}</span>
                    </div>
                    <span className="testimonial-location">{r.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
