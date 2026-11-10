import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MathText } from '@/components/common/MathText';

describe('MathText Component', () => {
  it('renders plain text without math delimiters properly', () => {
    const { container } = render(<MathText text="The ratio compounded of 2 : 3 is" />);
    expect(container.textContent).toContain('The ratio compounded of 2 : 3 is');
  });

  it('renders inline math with fraction and powers using KaTeX', () => {
    const { container } = render(<MathText text="The value of $\\frac{a}{5} + x^2$ is" />);
    expect(container.querySelector('.katex')).not.toBeNull();
    expect(container.querySelector('.katex-html')).not.toBeNull();
    expect(container.textContent).toContain('The value of');
  });

  it('renders block math expressions', () => {
    const { container } = render(<MathText text="$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$" block />);
    expect(container.querySelector('.math-block')).not.toBeNull();
    expect(container.querySelector('.katex-display')).not.toBeNull();
  });

  it('auto-detects standalone LaTeX formulas like \\frac without delimiters', () => {
    const { container } = render(<MathText text="\\frac{p}{p+q}" />);
    expect(container.querySelector('.katex')).not.toBeNull();
  });

  it('handles empty or null text safely without crashing', () => {
    const { container } = render(<MathText text="" />);
    expect(container.firstChild).toBeNull();
  });
});
