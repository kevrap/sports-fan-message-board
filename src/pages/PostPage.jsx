import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [editError, setEditError] = useState('')
  const [commentError, setCommentError] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  useEffect(() => {
    if (!user) return
    supabase
      .from('post_upvotes')
      .select('post_id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setHasUpvoted(!!data))
  }, [id, user])

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) console.error(error)
    else {
      setPost(data)
      setEditTitle(data.title)
      setEditContent(data.content || '')
      setEditImageUrl(data.image_url || '')
    }
    setLoading(false)
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    if (error) console.error(error)
    else setComments(data || [])
  }

  async function handleUpvote() {
    if (!user) { navigate('/auth'); return }
    if (hasUpvoted) return

    const { error: insertError } = await supabase
      .from('post_upvotes')
      .insert({ post_id: id, user_id: user.id })

    if (insertError) return

    const { data, error } = await supabase
      .from('posts')
      .update({ upvotes: post.upvotes + 1 })
      .eq('id', id)
      .select()
      .single()

    if (!error) {
      setPost(data)
      setHasUpvoted(true)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return
    await supabase.from('comments').delete().eq('post_id', id)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) navigate('/')
  }

  async function handleEdit(e) {
    e.preventDefault()
    if (!editTitle.trim()) return
    setEditError('')

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: editTitle.trim(),
        content: editContent.trim() || null,
        image_url: editImageUrl.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setEditError('Failed to save changes. Please try again.')
      console.error(error)
    } else {
      setPost(data)
      setEditing(false)
    }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmittingComment(true)
    setCommentError('')

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: id, content: newComment.trim(), user_id: user.id })
      .select()
      .single()

    setSubmittingComment(false)
    if (error) {
      setCommentError('Failed to post comment. Please try again.')
      console.error(error)
    } else {
      setComments(prev => [...prev, data])
      setNewComment('')
    }
  }

  async function handleDeleteComment(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const isOwner = user && post && user.id === post.user_id

  if (loading) return <p className="status-msg">Loading post...</p>
  if (!post) return (
    <div className="status-msg">
      <p>Post not found.</p>
      <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Back to Home</Link>
    </div>
  )

  return (
    <div className="post-page">
      <Link to="/" className="back-link">← Back to feed</Link>

      {isOwner && editing ? (
        <form className="post-form" onSubmit={handleEdit}>
          <h2>Edit Post</h2>
          <label className="form-label">
            Title <span className="required">*</span>
            <input
              className="form-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              required
            />
          </label>
          <label className="form-label">
            Content <span className="optional">(optional)</span>
            <textarea
              className="form-input"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={6}
            />
          </label>
          <label className="form-label">
            Image URL <span className="optional">(optional)</span>
            <input
              className="form-input"
              value={editImageUrl}
              onChange={e => setEditImageUrl(e.target.value)}
              type="url"
            />
          </label>
          {editError && <p className="form-error">{editError}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="post-detail-header">
            <div>
              <h1 className="post-detail-title">{post.title}</h1>
              <p className="post-detail-date">{new Date(post.created_at).toLocaleString()}</p>
            </div>
          </div>

          {post.image_url && (
            <div className="post-image-wrapper">
              <img src={post.image_url} alt="Post image" className="post-image" />
            </div>
          )}

          {post.content && (
            <div className="post-content">
              <p>{post.content}</p>
            </div>
          )}

          <div className="post-actions">
            <button className="btn btn-upvote" onClick={handleUpvote} disabled={hasUpvoted}>
              ▲ {hasUpvoted ? 'Upvoted' : 'Upvote'} &nbsp;<span className="upvote-count">{post.upvotes}</span>
            </button>
            {isOwner && (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </>
            )}
          </div>

          <section className="comments-section">
            <h3>Comments <span className="comment-count">({comments.length})</span></h3>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-card">
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-footer">
                      <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                      {user && user.id === comment.user_id && (
                        <button
                          className="btn-delete-comment"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {user ? (
              <form className="comment-form" onSubmit={handleAddComment}>
                <textarea
                  className="form-input"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  required
                />
                {commentError && <p className="form-error">{commentError}</p>}
                <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <p className="login-prompt">
                <Link to="/auth">Log in</Link> to leave a comment.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
