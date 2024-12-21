import { render } from '@testing-library/react';

import ReactMui from './react-mui';

describe('ReactMui', () => {
  it('should render successfully. ok', () => {
    const { baseElement } = render(<ReactMui />);
    expect(baseElement).toBeTruthy();
  });
});
