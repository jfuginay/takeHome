import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

type WithRoleProtectionProps = {
  allowedRoles: string[];
};

const withRoleProtection = (
  Component: React.ComponentType<any>,
  allowedRoles: string[]
) => {
  const RoleProtectedComponent: React.FC = (props: any) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Wait for authentication to load

      // Redirect to sign-in if not authenticated
      if (status === 'unauthenticated') {
        signIn();
      }

      // Redirect to unauthorized page if user role is not permitted
      if (
        status === 'authenticated' &&
        (!session?.user?.role || !allowedRoles.includes(session?.user?.role))
      ) {
        router.push('/unauthorized');
      }
    }, [session, status, router, allowedRoles]);

    // While authentication is being established, show a loader
    if (status === 'loading') {
      return <div>Loading...</div>; // Replace with your loading indicator if necessary
    }

    return (
      <React.Fragment>
        {/* Only render the component if authenticated and authorized */}
        {status === 'authenticated' &&
          session?.user?.role &&
          allowedRoles.includes(session.user.role) && (
            <Component {...props} />
          )}
      </React.Fragment>
    );
  };

  return RoleProtectedComponent;
};

export default withRoleProtection;