import { render } from '@testing-library/react';
import { QLogicBuilder } from './QLogicBuilder';

describe('QLogicBuilder', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<QLogicBuilder />);
    expect(baseElement).toBeTruthy();
  });
});
