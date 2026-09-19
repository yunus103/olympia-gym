"use client";

import { Component, ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  onError: () => void;
  children: ReactNode;
}

// Catches WebGL/GLB/chunk failures from the 3D hero so the rest of the page keeps rendering.
export class HeroErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
