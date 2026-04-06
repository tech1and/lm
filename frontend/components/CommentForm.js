import { useState, useEffect, useRef } from 'react';
import { shopsAPI } from '../lib/api';
import { Star, Send, ShieldCheck, SquarePen, CheckCircle } from 'lucide-react';

export default function CommentForm({ slug, onCommentAdded }) {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    text: '',
    rating: 5,
    honeypot: '',
  });
  const [formStartTime, setFormStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    setFormStartTime(Date.now());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'text') setCharCount(value.length);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.author_name.trim() || formData.author_name.length < 2) {
      newErrors.author_name = 'Введите ваше имя (минимум 2 символа)';
    }
    if (!formData.author_email.includes('@')) {
      newErrors.author_email = 'Введите корректный email';
    }
    if (!formData.text.trim() || formData.text.length < 10) {
      newErrors.text = 'Комментарий должен содержать минимум 10 символов';
    }
    if (formData.text.length > 2000) {
      newErrors.text = 'Комментарий слишком длинный (максимум 2000 символов)';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const timeSpent = Math.floor((Date.now() - formStartTime) / 1000);

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        form_time: timeSpent,
      };
      const res = await shopsAPI.addComment(slug, payload);
      setSuccess(true);
      setFormData({
        author_name: '',
        author_email: '',
        text: '',
        rating: 5,
        honeypot: '',
      });
      setCharCount(0);
      setFormStartTime(Date.now());

      if (onCommentAdded) {
        onCommentAdded(res.data);
      }
    } catch (err) {
      if (err.response?.data) {
        const apiErrors = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          apiErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: 'Ошибка отправки. Пожалуйста, попробуйте позже.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <strong className="text-green-800">Спасибо за ваш отзыв!</strong>
          <p className="text-sm text-green-700 mb-0">Комментарий успешно добавлен.</p>
        </div>
        <button
          className="px-3 py-1.5 text-sm border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
          onClick={() => setSuccess(false)}
        >
          Написать ещё
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="comment-form"
      noValidate
    >
      <h5 className="text-lg font-bold mb-4 flex items-center gap-2">
        <SquarePen className="w-5 h-5 text-blue-600" />
        Оставить отзыв
      </h5>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
          {errors.general}
        </div>
      )}

      {/* Honeypot поле */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Рейтинг */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Оценка</label>
        <div className="star-rating">
          {[5, 4, 3, 2, 1].map(star => (
            <label key={star} htmlFor={`star-${star}`} title={`${star} звёзд`}>
              <input
                type="radio"
                id={`star-${star}`}
                name="rating"
                value={star}
                checked={parseInt(formData.rating) === star}
                onChange={handleChange}
              />
              <Star className="w-6 h-6" />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Имя */}
        <div>
          <label className="block font-semibold mb-1.5" htmlFor="author_name">
            Ваше имя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="author_name"
            name="author_name"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.author_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            value={formData.author_name}
            onChange={handleChange}
            placeholder="Иван Иванов"
            maxLength={100}
          />
          {errors.author_name && (
            <p className="text-red-500 text-sm mt-1">{errors.author_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold mb-1.5" htmlFor="author_email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="author_email"
            name="author_email"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.author_email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            value={formData.author_email}
            onChange={handleChange}
            placeholder="ivan@example.com"
          />
          {errors.author_email && (
            <p className="text-red-500 text-sm mt-1">{errors.author_email}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Email не публикуется</p>
        </div>
      </div>

      {/* Текст */}
      <div className="mb-4">
        <label className="block font-semibold mb-1.5" htmlFor="text">
          Ваш отзыв <span className="text-red-500">*</span>
        </label>
        <textarea
          id="text"
          name="text"
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
            errors.text ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          value={formData.text}
          onChange={handleChange}
          rows={4}
          placeholder="Поделитесь своим опытом пользования данным магазином..."
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-1.5">
          {errors.text ? (
            <p className="text-red-500 text-sm">{errors.text}</p>
          ) : (
            <p className="text-gray-500 text-xs">Минимум 10 символов</p>
          )}
          <p className="text-gray-500 text-xs">{charCount}/2000</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Отправить отзыв
            </>
          )}
        </button>
        <span className="text-gray-500 text-sm flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" />
          Защита от спама
        </span>
      </div>
    </form>
  );
}
