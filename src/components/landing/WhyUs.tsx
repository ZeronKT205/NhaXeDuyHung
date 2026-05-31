import { getTranslations } from 'next-intl/server';

export default async function WhyUs() {
  const t = await getTranslations('whyUs');
  const items = t.raw('items') as { num: string; title: string; desc: string }[];

  return (
    <section className="section why-us-section" id="why-us">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('label')}</span>
          <div className="section-title-row">
            <h2 className="section-title">{t('title')}</h2>
          </div>
        </div>

        <div className="why-timeline">
          {items.map((pt) => (
            <div
              key={pt.num}
              className={`why-item ${parseInt(pt.num) % 2 === 1 ? 'why-item-left' : 'why-item-right'}`}
            >
              <span className="why-num">{pt.num}</span>
              <div className="why-card">
                <h3 className="why-card-title">{pt.title}</h3>
                <p className="why-card-desc">{pt.desc}</p>
                <span className="why-mark">///</span>
              </div>
              <div className="why-connector" />
              <div className="why-dot" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
