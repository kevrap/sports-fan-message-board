import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')

  useEffect(() => {
    fetchPosts()
  }, [sortBy])

  async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, upvotes, created_at')
      .order(sortBy, { ascending: false })

    if (error) console.error(error)
    else setPosts(data || [])
    setLoading(false)
  }

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="home-page">
      <div className="controls">
        <input
          type="text"
          placeholder="Search posts by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="sort-controls">
          <span>Sort by:</span>
          <button
            className={`sort-btn${sortBy === 'created_at' ? ' active' : ''}`}
            onClick={() => setSortBy('created_at')}
          >
            Newest
          </button>
          <button
            className={`sort-btn${sortBy === 'upvotes' ? ' active' : ''}`}
            onClick={() => setSortBy('upvotes')}
          >
            Top
          </button>
        </div>
      </div>

      {loading ? (
        <p className="status-msg">Loading posts...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="status-msg">
          {search ? 'No posts match your search.' : 'No posts yet. Be the first to create one!'}
        </p>
      ) : (
        <div className="posts-feed">
          {filteredPosts.map(post => (
            <Link to={`/post/${post.id}`} key={post.id} className="post-card">
              <div className="post-card-body">
                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-date">{new Date(post.created_at).toLocaleString()}</p>
              </div>
              <div className="post-card-upvotes">
                <span className="upvote-arrow">▲</span>
                <span>{post.upvotes}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
