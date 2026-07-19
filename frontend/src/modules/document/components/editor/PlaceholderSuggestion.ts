import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SuggestionOptions } from '@tiptap/suggestion';
import { PlaceholderSuggestionList, PlaceholderSuggestionListRef } from './PlaceholderSuggestionList';

export function createPlaceholderSuggestion(
  fetchPlaceholders: (query: string) => Promise<any[]>
): Omit<SuggestionOptions, 'editor'> {
  return {
    char: '{{',
    items: async ({ query }) => {
      return await fetchPlaceholders(query);
    },
    render: () => {
      let component: ReactRenderer<PlaceholderSuggestionListRef>;
      let popup: TippyInstance[];

      return {
        onStart: (props) => {
          component = new ReactRenderer(PlaceholderSuggestionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return component.ref?.onKeyDown(props) || false;
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  };
}
