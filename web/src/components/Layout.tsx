import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <>
      <div style={{ paddingBottom: '80px' }}><Outlet /></div>
      <Navigation />
    </>
  );
}
