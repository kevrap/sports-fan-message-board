import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
        upvotes: 0,
      })
      .select()
      .single()

    setSubmitting(false)
    if (insertError) {
      setError(`Failed to create post: ${insertError.message}`)
      console.error(insertError)
    } else {
      navigate(`/post/${data.id}`)
    }
  }

  return (
    <div className="form-page">
      <h1>Create a New Post</h1>
      <form className="post-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Title <span className="required">*</span>
          <input
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give your post a title"
            required
          />
        </label>

        <label className="form-label">
          Content <span className="optional">(optional)</span>
          <textarea
            className="form-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Add some text to your post..."
            rows={6}
          />
        </label>

        <label className="form-label">
          Image URL <span className="optional">(optional)</span>
          <input
            className="form-input"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Post'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
