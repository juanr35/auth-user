import { getProviders, signIn, signOut, useSession, getSession } from 'next-auth/react'
import { getCsrfToken } from "next-auth/react"
import { useRouter } from 'next/router';

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  return {
    redirect: {
      permanent: false,
      destination: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/profile`,
    }
  };
}

export default function Index() {

  return (
    <div>
    </div>  
  );
};