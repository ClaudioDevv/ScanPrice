interface ButtonProps {
  text: string
  onClick?: () => void
}

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} style={{
      backgroundColor: '#1a3a5c',
      color: 'white',
      padding: '11px 20px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      cursor: 'pointer',
    }}>
      {text}
    </button>
  )
}