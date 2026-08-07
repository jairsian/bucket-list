'use client';

import { useState, useEffect } from 'react';

interface Photo {
  index: number;
  name: string;
  photoUrl: string;
}

interface PhotoSelectorProps {
  placeId: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function PhotoSelector({ placeId, selectedIndex, onSelect, onClose }: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch(`/api/place-photos?placeId=${placeId}`);
        if (response.ok) {
          const data = await response.json();
          setPhotos(data.photos);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [placeId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-6">No photos available for this location</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Select Photo</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Preview</p>
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
              <img
                src={photos[currentIndex].photoUrl}
                alt={`Photo ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Available Photos ({photos.length})</p>
            <div className="grid grid-cols-5 gap-2">
              {photos.map((photo) => (
                <button
                  key={photo.index}
                  onClick={() => setCurrentIndex(photo.index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === photo.index
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <img
                    src={photo.photoUrl}
                    alt={`Photo ${photo.index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-white font-medium">{photo.index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelect(currentIndex);
                onClose();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Select Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
