import React, { FC } from 'react';

import { ExampleSocialEditor } from '@remirror/react-showcase';

const SocialEditor: FC = () => <ExampleSocialEditor suppressHydrationWarning={true} />;
SocialEditor.displayName = 'SocialEditor';

export default SocialEditor;