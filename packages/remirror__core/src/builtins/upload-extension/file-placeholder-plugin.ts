import { EditorState, Plugin, PluginKey, Transaction } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { ActionType, PlaceholderPluginAction } from './file-placeholder-actions';

interface UploadPlaceholderPluginData {
  set: DecorationSet;
  payloads: Map<string, any>;
}

const key = new PluginKey<UploadPlaceholderPluginData>('remirroFilePlaceholderPlugin');

export function createUploadPlaceholderPlugin(): Plugin<UploadPlaceholderPluginData> {
  return new Plugin<UploadPlaceholderPluginData>({
    key: key,
    state: {
      init(): UploadPlaceholderPluginData {
        return { set: DecorationSet.empty, payloads: new Map<string, any>() };
      },
      apply(tr, { set, payloads }: UploadPlaceholderPluginData): UploadPlaceholderPluginData {
        // Adjust decoration positions to changes made by the transaction
        set = set.map(tr.mapping, tr.doc);
        // See if the transaction adds or removes any placeholders
        const action = tr.getMeta(this) as PlaceholderPluginAction | null;

        if (action) {
          if (action.type === ActionType.ADD_PLACEHOLDER) {
            const widget = document.createElement('placeholder');
            const deco = Decoration.widget(action.pos, widget, { id: action.id });
            set = set.add(tr.doc, [deco]);
            payloads.set(action.id, action.payload);
          } else if (action.type === ActionType.REMOVE_PLACEHOLDER) {
            set = set.remove(set.find(undefined, undefined, (spec) => spec.id === action.id));
            payloads.delete(action.id);
          }
        }

        return { set, payloads };
      },
    },
    props: {
      decorations(state) {
        return this.getState(state).set;
      },
    },
  });
}

export function findUploadPlaceholderPos(state: EditorState, id: string): number | undefined {
  const set = key.getState(state)?.set;

  if (!set) {
    return undefined;
  }

  const found = set.find(undefined, undefined, (spec) => spec.id === id);
  return found[0]?.from;
}

export function findUploadPlaceholderPayload(state: EditorState, id: string): any | undefined {
  const payloads = key.getState(state)?.payloads;

  if (!payloads) {
    return undefined;
  }

  return payloads.get(id);
}

/**
 * Determine if there are active file uploads in the given state
 *
 * @remarks
 * This utility is useful to warn users there are still active uploads before
 * exiting or saving a document.
 *
 * @see https://remirror.vercel.app/?path=/story/extensions-file--with-upload-incomplete-warning
 *
 * @param state - the editor state
 */
export function hasUploadingFile(state: EditorState): boolean {
  const placeholderCount = key.getState(state)?.payloads?.size ?? 0;
  return placeholderCount > 0;
}

export function setUploadPlaceholderAction(
  tr: Transaction,
  action: PlaceholderPluginAction,
): Transaction {
  return tr.setMeta(key, action);
}
