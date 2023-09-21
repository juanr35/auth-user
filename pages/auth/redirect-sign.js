import { getProviders, signIn, signOut, useSession, getSession, getCsrfToken } from 'next-auth/react'
import Layout from '../../components/authForm/Layout'
import SignOutSession from '../../components/authForm/SignOutSession'

export async function getServerSideProps(context) {

  const providers = await getProviders()
  const csrfToken = await getCsrfToken(context)
  const session = await getSession(context)

  if (!session) {
    console.log("User not logged in")
    return {
      redirect: {
        permanent: false,
        destination: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/signin`,
      }
    };
  }

  return {
    props: {
      providers,
      csrfToken,
    },
  }
}

export default function signin({providers, csrfToken, baseUrl}) {
  
  return (
      <SignOutSession 
        providers={providers} 
        csrfToken={csrfToken}
      />
    
  )
}