/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0 */
import * as stories from './index.stories';
import { act, render } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';
import { delay } from '$common/utils';

jest.retryTimes(3);
jest.setTimeout(40000);

jest.mock('@ada/api-client');

const { Primary, Coverage } = composeStories(stories);

describe('views/goverance/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storybook', () => {
    it('Primary', async () => {
      const { container } = render(<Primary {...(Primary.args as any)} />);

      expect(container).toBeDefined();
    });
    it('Coverage', async () => {
      const { container } = render(<Coverage {...(Coverage.args as any)} />);

      await act(async () => {
        await delay(10);
      });

      await act(async () => {
        await Coverage.play({ canvasElement: container });
      });
    });
  })
});
