import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import React from 'react';

interface TagInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value, onChange, placeholder, disabled, className }, ref) => {
    const [inputValue, setInputValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Convert string of comma-separated tags to array and back
    const tags = value ? value.split(',').filter(Boolean) : [];

    const updateTags = (newTags: string[]) => {
      onChange(newTags.join(','));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = inputValue.trim();

        if (tag && !tags.includes(tag)) {
          updateTags([...tags, tag]);
          setInputValue('');
        }
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        e.preventDefault();
        const newTags = tags.slice(0, -1);
        updateTags(newTags);
      }
    };

    const removeTag = (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      updateTags(newTags);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    return (
      <div
        className='space-y-2 bg-transparent'
        onClick={() => inputRef.current?.focus()}
      >
        <Input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className={className}
        />
        <div className='flex flex-wrap gap-2'>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant='secondary'
              className='bg-white/10 text-white flex items-center gap-1'
            >
              {tag}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className='hover:text-red-400 transition-colors'
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';

export default TagInput;
