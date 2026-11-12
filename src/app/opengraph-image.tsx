import { ImageResponse } from 'next/og';

export const alt = 'StockNext: gestión de inventario y ventas para comercios';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background:
            'linear-gradient(120deg, #09090b 0%, #111827 58%, #312e81 100%)',
          color: '#ffffff',
          display: 'flex',
          fontFamily: 'Arial, Helvetica, sans-serif',
          height: '100%',
          justifyContent: 'space-between',
          overflow: 'hidden',
          padding: '72px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: '28px',
            boxShadow: '0 20px 70px rgba(6, 182, 212, 0.25)',
            display: 'flex',
            height: '88px',
            justifyContent: 'center',
            width: '88px',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              border: '3px solid #ffffff',
              borderRadius: '16px',
              color: '#ffffff',
              display: 'flex',
              fontSize: '38px',
              fontWeight: 700,
              height: '58px',
              justifyContent: 'center',
              marginTop: '15px',
              width: '58px',
            }}
          >
            S
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '710px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', fontSize: '58px', fontWeight: 700 }}>
            <span>Stock</span>
            <span style={{ color: '#67e8f9' }}>Next</span>
          </div>
          <div
            style={{
              color: '#c7d2fe',
              display: 'flex',
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '3px',
              marginTop: '18px',
              textTransform: 'uppercase',
            }}
          >
            Gestión simple para tu comercio
          </div>
          <div
            style={{
              color: '#f4f4f5',
              display: 'flex',
              fontSize: '42px',
              fontWeight: 600,
              lineHeight: 1.25,
              marginTop: '36px',
            }}
          >
            Productos, ventas y stock desde un solo lugar.
          </div>
          <div
            style={{
              background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
              borderRadius: '999px',
              display: 'flex',
              height: '8px',
              marginTop: '38px',
              width: '160px',
            }}
          />
        </div>
        <div
          style={{
            background: 'rgba(34, 211, 238, 0.13)',
            border: '1px solid rgba(103, 232, 249, 0.25)',
            borderRadius: '50%',
            height: '460px',
            position: 'absolute',
            right: '-150px',
            top: '-210px',
            width: '460px',
          }}
        />
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.18)',
            borderRadius: '50%',
            bottom: '-270px',
            height: '520px',
            position: 'absolute',
            right: '210px',
            width: '520px',
          }}
        />
        <div
          style={{
            bottom: '52px',
            color: '#a1a1aa',
            display: 'flex',
            fontSize: '18px',
            position: 'absolute',
            right: '72px',
          }}
        >
          stocknext
        </div>
      </div>
    ),
    size,
  );
}
