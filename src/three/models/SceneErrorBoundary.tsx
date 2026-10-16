import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * If the 3D reveal can't load (e.g. the texture download fails), render nothing
 * instead of crashing the whole Canvas. The result card still shows the artwork.
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.warn('3D reveal unavailable:', error.message);
  }

  render(): ReactNode {
    return this.state.hasError ? null : this.props.children;
  }
}
