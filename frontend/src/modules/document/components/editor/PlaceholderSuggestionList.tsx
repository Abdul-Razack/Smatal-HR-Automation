import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

interface PlaceholderSuggestionListProps {
  items: any[];
  command: (item: any) => void;
}

export interface PlaceholderSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const PlaceholderSuggestionList = forwardRef<PlaceholderSuggestionListRef, PlaceholderSuggestionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        // TipTap automatically removes the query and triggers insert.
        // We just need to insert the parsed key wrapped in brackets if needed,
        // or just rely on the command handling the exact replacement text.
        props.command({ id: item.key, label: `{{${item.key}}}` });
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="bg-white border shadow-md rounded-md overflow-hidden min-w-[200px]">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              className={`w-full text-left px-3 py-2 text-sm flex flex-col ${
                index === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <span className="font-medium">{item.name}</span>
              <span className={`text-xs ${index === selectedIndex ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {item.key}
              </span>
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">No result</div>
        )}
      </div>
    );
  }
);

PlaceholderSuggestionList.displayName = 'PlaceholderSuggestionList';
