'use client';

export default function RouteMap() {
  // Google Maps Directions embed drawing the route line: Hue -> Da Nang -> Hoi An
  const embedUrl = "https://maps.google.com/maps?saddr=Th%C3%A0nh+ph%E1%BB%91+Hu%E1%BA%BF&daddr=%C4%90%C3%A0+N%E1%BA%B5ng+to:H%E1%BB%99i+An&t=&z=9&ie=UTF8&iwloc=&output=embed";

  return (
    <div className="svg-map-wrapper svg-map-container" style={{ border: 'none', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{
          border: 0,
          display: 'block',
          position: 'absolute',
          top: '-220px',
          left: '0',
          width: '100%',
          height: 'calc(100% + 440px)'
        }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Bản đồ lộ trình Bảo Châu"
      />
    </div>
  );
}
