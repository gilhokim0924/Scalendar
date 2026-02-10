import type { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <div style={{ paddingBottom: '80px' }}>{children}</div>
      <Navigation />
    </>
  );
}
