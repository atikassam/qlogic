import { render } from '@testing-library/react';

import ReactMui from './react-mui';

describe('ReactMui', () => {
  it('should render successfully. LIKO', () => {
    const { baseElement } = render(<ReactMui />);
    expect(baseElement).toBeTruthy();
  });
});
