'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Plus, Trash2, Loader2, AlertCircle, List, Heart as HeartIcon, PlayCircle } from 'lucide-react';
import { getFavorites, getPlaylists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist } from '@/lib/api/statistics';
import { getAllSongs } from '@/lib/api/songs';
import { Song } from '@/types/song';
import { SongCard } from '@/components/audio/SongCard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import './library.css';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  songs: Array<{
    id: string;
    songId: string;
    position: number;
    song: Song;
  }>;
}

interface Favorite {
  id: string;
  songId: string;
  createdAt: string;
  song: Song;
}

function LibraryContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'favorites' | 'playlists'>('favorites');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create playlist modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Add songs modal
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      setError('');
      const [favoritesData, playlistsData] = await Promise.all([
        getFavorites(),
        getPlaylists()
      ]);
      setFavorites(favoritesData);
      setPlaylists(playlistsData);
    } catch (err: any) {
      console.error('Error loading library:', err);
      setError(err.message || 'Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      setCreating(true);
      await createPlaylist(newPlaylistName, newPlaylistDescription || undefined);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateModal(false);
      await loadLibraryData();
    } catch (err: any) {
      console.error('Error creating playlist:', err);
      alert(err.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAddSongs = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowAddSongsModal(true);
    setLoadingSongs(true);

    try {
      const data = await getAllSongs(100, 0);
      setAvailableSongs(data.songs);
    } catch (err: any) {
      console.error('Error loading songs:', err);
      alert('Failed to load songs');
    } finally {
      setLoadingSongs(false);
    }
  };

  const handleAddSongToPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return;

    try {
      setAddingToPlaylist(songId);
      await addSongToPlaylist(selectedPlaylist.id, songId);
      await loadLibraryData();
      // Update selected playlist
      const updatedPlaylist = playlists.find(p => p.id === selectedPlaylist.id);
      if (updatedPlaylist) {
        setSelectedPlaylist(updatedPlaylist);
      }
    } catch (err: any) {
      console.error('Error adding song to playlist:', err);
      alert(err.message || 'Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const handleRemoveSongFromPlaylist = async (playlistId: string, songId: string) => {
    if (!confirm('Remove this song from the playlist?')) return;

    try {
      await removeSongFromPlaylist(playlistId, songId);
      await loadLibraryData();
      // Update selected playlist if it's the current one
      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        const updatedPlaylist = playlists.find(p => p.id === playlistId);
        if (updatedPlaylist) {
          setSelectedPlaylist(updatedPlaylist);
        }
      }
    } catch (err: any) {
      console.error('Error removing song:', err);
      alert(err.message || 'Failed to remove song');
    }
  };

  if (loading) {
    return (
      <div className="library-page">
        <div className="library-loading">
          <Loader2 size={48} className="spinner" />
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="library-header-content">
          <Music size={48} />
          <div>
            <h1>Your Library</h1>
            <p>Your favorite songs and playlists</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="library-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadLibraryData} className="library-retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <HeartIcon size={20} />
          <span>Favorites ({favorites.length})</span>
        </button>
        <button
          className={`library-tab ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          <List size={20} />
          <span>Playlists ({playlists.length})</span>
        </button>
      </div>

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="library-content">
          {favorites.length === 0 ? (
            <div className="library-empty">
              <HeartIcon size={80} />
              <h2>No favorites yet</h2>
              <p>Songs you favorite will appear here</p>
              <button onClick={() => router.push('/songs')} className="library-browse-btn">
                Browse Music
              </button>
            </div>
          ) : (
            <div className="library-grid">
              {favorites.map((favorite) => (
                <SongCard key={favorite.id} song={favorite.song} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <div className="library-content">
          <div className="playlists-header">
            <button onClick={() => setShowCreateModal(true)} className="create-playlist-btn">
              <Plus size={20} />
              <span>Create Playlist</span>
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="library-empty">
              <List size={80} />
              <h2>No playlists yet</h2>
              <p>Create a playlist to organize your favorite songs</p>
              <button onClick={() => setShowCreateModal(true)} className="library-browse-btn">
                <Plus size={20} />
                Create Your First Playlist
              </button>
            </div>
          ) : (
            <div className="playlists-list">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="playlist-card">
                  <div className="playlist-card-header">
                    <div className="playlist-info">
                      <div className="playlist-icon">
                        <List size={24} />
                      </div>
                      <div>
                        <h3>{playlist.name}</h3>
                        {playlist.description && <p className="playlist-description">{playlist.description}</p>}
                        <p className="playlist-meta">{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenAddSongs(playlist)}
                      className="add-songs-btn"
                    >
                      <Plus size={18} />
                      Add Songs
                    </button>
                  </div>

                  {playlist.songs.length > 0 ? (
                    <div className="playlist-songs">
                      {playlist.songs
                        .sort((a, b) => a.position - b.position)
                        .map((playlistSong) => (
                          <div key={playlistSong.id} className="playlist-song-item">
                            <div className="playlist-song-info">
                              <Music size={16} />
                              <div>
                                <p className="playlist-song-title">{playlistSong.song.title}</p>
                                <p className="playlist-song-artist">{playlistSong.song.artist?.name || 'Unknown Artist'}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveSongFromPlaylist(playlist.id, playlistSong.songId)}
                              className="remove-song-btn"
                              title="Remove from playlist"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="playlist-empty">
                      <p>No songs in this playlist yet</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Playlist</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Playlist Name *</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Describe your playlist..."
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="modal-cancel-btn"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  className="modal-submit-btn"
                  disabled={creating || !newPlaylistName.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      Creating...
                    </>
                  ) : (
                    'Create Playlist'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Songs Modal */}
      {showAddSongsModal && selectedPlaylist && (
        <div className="modal-overlay" onClick={() => setShowAddSongsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Add Songs to "{selectedPlaylist.name}"</h2>

            {loadingSongs ? (
              <div className="modal-loading">
                <Loader2 size={32} className="spinner" />
                <p>Loading songs...</p>
              </div>
            ) : (
              <div className="songs-select-list">
                {availableSongs.length === 0 ? (
                  <p className="no-songs">No songs available</p>
                ) : (
                  availableSongs.map((song) => {
                    const isInPlaylist = selectedPlaylist.songs.some(ps => ps.songId === song.id);
                    const isAdding = addingToPlaylist === song.id;

                    return (
                      <div key={song.id} className="song-select-item">
                        <div className="song-select-info">
                          <Music size={20} />
                          <div>
                            <p className="song-select-title">{song.title}</p>
                            <p className="song-select-artist">{song.artist?.name || 'Unknown Artist'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSongToPlaylist(song.id)}
                          disabled={isInPlaylist || isAdding}
                          className={`song-select-btn ${isInPlaylist ? 'added' : ''}`}
                        >
                          {isAdding ? (
                            <Loader2 size={16} className="spinner" />
                          ) : isInPlaylist ? (
                            'Added'
                          ) : (
                            <Plus size={16} />
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="modal-actions">
              <button
                onClick={() => setShowAddSongsModal(false)}
                className="modal-cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <LibraryContent />
    </ProtectedRoute>
  );
}
