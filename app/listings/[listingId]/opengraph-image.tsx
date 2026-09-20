import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export const alt = 'BoardTAU Listing Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;

  let title = 'Boarding House Listing';
  let price = '';
  let propertyType = 'Boarding House';
  let address = 'Camiling, Tarlac';

  try {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: {
        title: true,
        price: true,
        region: true,
        country: true,
        propertyType: {
          select: { name: true },
        },
      },
    });

    if (listing) {
      title = listing.title;
      price = `₱${listing.price.toLocaleString()}/mo`;
      propertyType = listing.propertyType?.name || 'Boarding House';
      address = [listing.region, listing.country].filter(Boolean).join(', ') || 'Near TAU Campus, Tarlac';
    }
  } catch (err) {
    console.error('Failed to fetch listing for OG image:', err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* Header Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#2f7d6d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              🏠
            </div>
            <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Board<span style={{ color: '#2f7d6d' }}>TAU</span>
            </span>
          </div>

          <div
            style={{
              background: 'rgba(47, 125, 109, 0.2)',
              border: '1px solid #2f7d6d',
              color: '#34d399',
              padding: '8px 20px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            Verified Student Housing
          </div>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '20px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>
            {propertyType}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: '800',
              lineHeight: 1.2,
              color: '#f8fafc',
              maxHeight: '120px',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: '22px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 {address}
          </div>
        </div>

        {/* Footer Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #334155',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '42px', fontWeight: 'bold', color: '#34d399' }}>{price}</span>
            <span style={{ fontSize: '18px', color: '#94a3b8' }}>starting rate</span>
          </div>

          <div style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '500' }}>
            Tarlac Agricultural University Community Platform
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
