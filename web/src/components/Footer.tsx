import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Search, User } from 'lucide-react';
import type { NavItem } from '../types';

import './Footer.scss';

const routes: (NavItem & { label: string })[] = [
  { id: 'home', icon: <Home size={20} />, path: '/', tooltip: 'Home', label: 'Home' },
  { id: 'search', icon: <Search size={20} />, path: '/search', tooltip: 'Search', label: 'Search' },
  { id: 'library', icon: <Library size={20} />, path: '/library', tooltip: 'Library', label: 'Library' },
  { id: 'profile', icon: <User size={20} />, path: '/profile', tooltip: 'Profile', label: 'Profile' },
];

const Footer: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <footer className='app-footer'>
      <nav className='footer-nav'>
        {routes.map(({ id, icon, path, label }) => {
          const isActive = pathname === path;

          return (
            <Link key={id} to={path} className={`nav-item ${isActive ? 'active' : ''}`}>
              {icon}
              <span className='nav-label'>{label}</span>
              {/*{isActive && <div className='active-dot' />}*/}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
