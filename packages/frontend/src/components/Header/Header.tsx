import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-spacer" />
      <h1 className="header-title">ScanPrice</h1>
      <img src="/favicon.svg" alt="logo" className="header-logo" />
    </header>
  )
}