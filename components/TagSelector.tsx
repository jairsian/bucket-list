'use client';

import { useEffect, useState } from 'react';

type Tag = {
  id: number;
  user_id: string;
  name: string;
  color: string | null;
};

interface TagSelectorProps {
  selectedTagIds: number[];
  onTagsChange: (tagIds: number[]) => void;
  sessionToken?: string;
}

export function TagSelector({ selectedTagIds, onTagsChange, sessionToken }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionToken) return;

    async function fetchTags() {
      try {
        const response = await fetch('/api/tags', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTags(data || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, [sessionToken]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading tags...</p>;
  }

  if (tags.length === 0) {
    return <p className="text-sm text-muted-foreground">No tags yet. <a href="/tags" className="text-primary hover:opacity-75">Create one</a></p>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onTagsChange(selectedTagIds.filter(id => id !== tag.id));
                } else {
                  onTagsChange([...selectedTagIds, tag.id]);
                }
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'opacity-100 ring-2 ring-offset-2 ring-foreground'
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: tag.color || '#ccc',
                color: 'white',
              }}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
