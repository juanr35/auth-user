 export async function getServerSideProps(context) {
  return {
    redirect: {
      permanent: false,
      destination: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/signin?error=AccessDenied`,
    }
  };
  
}

export default function SignIn({ providers, csrfToken }) {
  return (
    <>
    <h1>Error</h1>
    </>
    )
  }
  
