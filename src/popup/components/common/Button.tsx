import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  size = 'medium',
  className = ''
}) => {
  const baseClasses = 'button';
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    danger: 'button-danger'
  };
  const sizeClasses = {
    small: 'button-small',
    medium: 'button-medium',
    large: 'button-large'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};