export default function Header() {
  return (
    <header style={{
      backgroundColor: '#1a3a5c',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      <div style={{ width: '40px' }} />
      <h1 style={{
        color: 'white',
        margin: 0,
        fontSize: '24px',
        fontWeight: 600,
      }}>
        ScanPrice
      </h1>
      <img
        src="/favicon.svg"
        alt="logo"
        style={{
          height: '40px',
          width: '40px',
        }}
      />
    </header>
  )
}