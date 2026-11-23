import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from './router';

export default function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href="#"
      {...rest}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onClick?.(e);
        navigate(href);
      }}
    />
  );
}
