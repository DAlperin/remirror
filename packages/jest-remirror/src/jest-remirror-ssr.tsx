import React from 'react';
import { renderToString } from 'react-dom/server';

import { AnyExtension, AnyPreset, EditorManager, object } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { RenderEditor } from '@remirror/react';

import { RenderEditorParameter } from './jest-remirror-types';

/**
 * Render the editor with the params passed in. Useful for testing.
 */
export function renderEditorString<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: RenderEditorParameter<ExtensionUnion, PresetUnion>): string {
  const {
    extensions = [] as ExtensionUnion[],
    presets = [] as PresetUnion[],
    props,
    settings = object(),
  } = parameter;
  const corePreset = CorePreset.of();

  const manager = EditorManager.of({
    extensions,
    presets: [...presets, corePreset],
    settings,
  });

  return renderToString(
    <RenderEditor {...props} manager={manager}>
      {(param) => {
        if (props?.children) {
          return props.children(param);
        }

        return <div />;
      }}
    </RenderEditor>,
  );
}
