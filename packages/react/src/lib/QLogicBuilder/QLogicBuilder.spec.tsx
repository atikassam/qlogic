import { render } from '@testing-library/react';
import { QLogicBuilder } from './QLogicBuilder';
import 'jest-canvas-mock';

describe('QLogicBuilder', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<QLogicBuilder />);
    expect(baseElement).toBeTruthy();
  });
});
