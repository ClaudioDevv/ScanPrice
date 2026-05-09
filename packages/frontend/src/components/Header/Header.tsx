import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-spacer" />
      <h1 className="header-title">ScanPrice</h1>
      <img src="/scanprice_icon.svg" alt="logo" className="header-logo" />
    </header>
  )
}