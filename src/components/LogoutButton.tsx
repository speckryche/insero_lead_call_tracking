'use client';

import { signOut } from '@/lib/auth-actions';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-gray-600 hover:text-gray-900 font-medium"
    >
      Logout
    </button>
  );
}
