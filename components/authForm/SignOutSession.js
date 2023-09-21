import React from "react";
import { useState, useEffect } from "react";
import { getProviders, signIn, signOut, useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router';

// reactstrap components
import { Modal } from "reactstrap";
import PageLoading from "./PageLoading"

export default function SignOutSession(props) {
  const { data: session, status } = useSession()
  const { query, push } = useRouter();
  
  useEffect(() => {    
    if ( session ) {
      signOut({redirect: false})
    }
    else if ( !session ) {
      push(`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/signin`)
    }
  }, [session])
   
  const [stateForm, setStateForm] = useState({
    loading: true,
    error: false
  });

  return (
    <>
      <Modal
        className="text-center" 
        isOpen={stateForm.loading}
        centered={true}
        fade={false}
      >
        <PageLoading heightCard={4}/>
      </Modal>
    </>
  );
}
