import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, email, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/auth')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">PostBoard</Link>
      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-username">{email}</span>
            <Link to="/create" className="btn btn-primary">+ New Post</Link>
            <button className="btn btn-secondary" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary">Log In</Link>
        )}
      </div>
    </nav>
  )
}
