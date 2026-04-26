import { useState } from 'react';
import { catalogAPI, shopsAPI } from '../lib/api';
import { Heart } from 'lucide-react';

export default function LikeButton({ slug, initialLikes, initialLiked, type = 'shop' }) {
  const [likesCount, setLikesCount] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(initialLiked || false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    setAnimating(true);

    try {
      const apiFunc = type === 'product' ? catalogAPI.like : shopsAPI.like;
      const res = await apiFunc(slug);
      setLikesCount(res.data.likes_count);
      setLiked(res.data.liked);
    } catch (err) {
      console.error('Ошибка лайка:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`like-btn ${liked ? 'liked' : ''}`}
      aria-label={liked ? 'Убрать лайк' : 'Поставить лайк'}
    >
      <span className={`like-icon ${animating ? 'liked' : ''}`}>
        <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
      </span>
      <span className="font-bold">
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
        ) : (
          likesCount.toLocaleString('ru')
        )}
      </span>
      <span className="hidden sm:inline">
        {liked ? 'Нравится' : 'Нравится?'}
      </span>
    </button>
  );
}
