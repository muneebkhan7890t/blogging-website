import React from 'react';

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

// A real <a href> that still gives the SPA an instant client-side transition.
// Plain left-clicks are intercepted and handled by onNavigate (no full page
// reload); Ctrl/Cmd/Shift/middle-clicks are left alone so "open in new tab",
// "open in new window", and "copy link" all keep working natively.
//
// This exists because every internal "link" on this site used to be a
// <button onClick={...}> with no href at all — which meant Google's crawler
// (and any other link-following bot) could never discover or follow a single
// internal link anywhere on the site, since it only follows real <a href>
// elements, never synthesizes clicks on buttons.
export const NavLink: React.FC<NavLinkProps> = ({ to, onNavigate, children, className, onClick, ...rest }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isModifiedClick = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    if (isModifiedClick) return; // let the browser handle it natively

    e.preventDefault();
    onClick?.(e);
    onNavigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};
