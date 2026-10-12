import React, { Suspense } from "react";
import NavbarClient from "./NavbarClient";
import { User } from "next-auth";

interface NavbarProps {
  user?: (User & { id: string; role?: string });
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <Suspense fallback={null}>
      <NavbarClient user={user} />
    </Suspense>
  );
};

export default Navbar;
