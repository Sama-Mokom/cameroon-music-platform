'use client';

import { useState } from 'react';
import { z } from 'zod';
import type { ArtistProfile, CreateArtistProfileData } from '@/types/artist';

const artistProfileSchema = z.object({
  stageName: z.string().min(2, 'Stage name must be at least 2 characters').max(100).optional().or(z.literal('')),
  bio: z.string().max(1000, 'Bio must not exceed 1000 characters').optional().or(z.literal('')),
  genres: z.array(z.string()).max(10, 'Maximum 10 genres allowed').optional(),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed').optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional().or(z.literal('')),
});

interface ArtistProfileFormProps {
  initialData?: ArtistProfile;
  onSubmit: (data: CreateArtistProfileData) => Promise<void>;
  onCancel?: () => void;
}

export default function ArtistProfileForm({ initialData, onSubmit, onCancel }: ArtistProfileFormProps) {
  const [formData, setFormData] = useState({
    stageName: initialData?.stageName || '',
    bio: initialData?.bio || '',
    phoneNumber: initialData?.phoneNumber || '',
  });

  const [genres, setGenres] = useState<string[]>(initialData?.genres || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [genreInput, setGenreInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleAddGenre = () => {
    if (genreInput.trim() && genres.length < 10 && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput('');
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setGenres(genres.filter(g => g !== genre));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 20 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const submitData = {
      stageName: formData.stageName || undefined,
      bio: formData.bio || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      genres: genres.length > 0 ? genres : undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      artistProfileSchema.parse(submitData);
      setLoading(true);
      await onSubmit(submitData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="artist-profile-form">
      <div className="form-section">
        <h2>Profile Information</h2>

        <div className="form-group">
          <label htmlFor="stageName">Stage Name</label>
          <input
            id="stageName"
            type="text"
            value={formData.stageName}
            onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
            placeholder="MC Cameroon"
            maxLength={100}
          />
          {errors.stageName && <span className="error">{errors.stageName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about your music journey..."
            maxLength={1000}
            rows={6}
          />
          <div className="char-count">{formData.bio.length}/1000</div>
          {errors.bio && <span className="error">{errors.bio}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+237612345678"
          />
          {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
        </div>
      </div>

      <div className="form-section">
        <h2>Genres</h2>
        <div className="tag-input-group">
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
            placeholder="Add a genre (e.g., Afrobeat, Makossa)"
            maxLength={50}
          />
          <button type="button" onClick={handleAddGenre} disabled={genres.length >= 10}>
            Add
          </button>
        </div>
        <div className="tags-container">
          {genres.map((genre) => (
            <span key={genre} className="tag">
              {genre}
              <button type="button" onClick={() => handleRemoveGenre(genre)}>×</button>
            </span>
          ))}
        </div>
        {genres.length >= 10 && <span className="info">Maximum 10 genres reached</span>}
        {errors.genres && <span className="error">{errors.genres}</span>}
      </div>

      <div className="form-section">
        <h2>Tags</h2>
        <div className="tag-input-group">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag (e.g., Douala, Traditional)"
            maxLength={50}
          />
          <button type="button" onClick={handleAddTag} disabled={tags.length >= 20}>
            Add
          </button>
        </div>
        <div className="tags-container">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
            </span>
          ))}
        </div>
        {tags.length >= 20 && <span className="info">Maximum 20 tags reached</span>}
        {errors.tags && <span className="error">{errors.tags}</span>}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>

      <style jsx>{`
        .artist-profile-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-section {
          background: #161616;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .form-section h2 {
          color: #2FFF8D;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #FFFFFF;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          background: #0F0F0F;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #FFFFFF;
          font-size: 1rem;
          transition: border-color 200ms;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #2FFF8D;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .char-count {
          text-align: right;
          color: #A0A0A0;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .tag-input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .tag-input-group input {
          flex: 1;
          background: #0F0F0F;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #FFFFFF;
        }

        .tag-input-group button {
          background: #2FFF8D;
          color: #0F0F0F;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 200ms, opacity 200ms;
        }

        .tag-input-group button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .tag-input-group button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          min-height: 40px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #2FFF8D;
          color: #0F0F0F;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tag button {
          background: none;
          border: none;
          color: #0F0F0F;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms;
        }

        .tag button:hover {
          transform: scale(1.2);
        }

        .error {
          display: block;
          color: #FF4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .info {
          display: block;
          color: #FFDD33;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 200ms, opacity 200ms;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2FFF8D 0%, #1acc6d 100%);
          color: #0F0F0F;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #333;
          color: #FFFFFF;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #161616;
        }

        @media (max-width: 768px) {
          .form-section {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
}
