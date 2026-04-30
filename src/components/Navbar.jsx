import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">PostBoard</Link>
      <Link to="/create" className="btn btn-primary">+ New Post</Link>
    </nav>
  )
}
