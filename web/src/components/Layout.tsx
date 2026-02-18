import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <>
      <div style={{ paddingBottom: '80px' }}><Outlet /></div>
      <Navigation />
    </>
  );
}
