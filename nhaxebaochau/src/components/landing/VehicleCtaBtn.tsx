'use client';

interface Props {
  seats: number;
  label?: string;
}

export default function VehicleCtaBtn({ seats, label = 'ĐẶT XE NGAY →' }: Props) {
  function handleClick() {
    window.dispatchEvent(new CustomEvent('pricing:filter', { detail: String(seats) }));
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <button className="vl-cta" onClick={handleClick}>
      {label}
    </button>
  );
}
