import type { Meta, StoryObj } from '@storybook/react';
import { QLogicBuilder } from './QLogicBuilder';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof QLogicBuilder> = {
  component: QLogicBuilder,
  title: 'QLogicBuilder',
};
export default meta;
type Story = StoryObj<typeof QLogicBuilder>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to QLogicBuilder!/gi)).toBeTruthy();
  },
};
