import React from 'react';

interface AuthorAvatarProps {
  name: string;
  avatar?: string;
  className: string;
  borderClassName?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
}

// Renders a real photo when one exists, otherwise a plain initials badge —
// never a fabricated stock-photo headshot standing in for a real person.
export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ name, avatar, className, borderClassName = '' }) => {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${className} object-cover ${borderClassName}`}
      />
    );
  }

  return (
    <div
      className={`${className} ${borderClassName} flex items-center justify-center bg-indigo-600 text-white font-bold shrink-0`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};
