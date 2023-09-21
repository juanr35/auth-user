import { getProviders, signIn, signOut, useSession, getSession, getCsrfToken } from 'next-auth/react'
import Layout from '../../../components/authForm/Layout'
import VerifyForm from '../../../components/authForm/VerifyForm'

import { useState, useEffect } from "react";

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
      title={"Verificar"}
      showLog={false}
      showReg={false} 
    >
      <VerifyForm 
        providers={providers} 
        csrfToken={csrfToken}
      />
    </Layout>
  )
}