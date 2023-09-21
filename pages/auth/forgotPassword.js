import { getProviders, signIn, signOut, useSession, getSession, getCsrfToken } from 'next-auth/react'
import Layout from '../../components/authForm/Layout'
import ForgotPasswordForm from '../../components/authForm/ForgotPasswordForm'

export async function getServerSideProps(context) {

  const providers = await getProviders()
  const csrfToken = await getCsrfToken(context)

  return {
    props: {
      providers,
      csrfToken,
    },
  }
}

export default function signin({providers, csrfToken, baseUrl}) {
  
  return (
    <Layout 
      title={"Recovery Password"}
      showLog={false}
      showReg={false} 
    >
      <ForgotPasswordForm 
        providers={providers} 
        csrfToken={csrfToken}
      />
    </Layout>
  )
}