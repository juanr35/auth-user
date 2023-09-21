import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import axios from "axios"

export default NextAuth({
  // Configure one or more authentication providers
  pages: {
    signIn: '/auth/signin',
    //signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      id: "credentials",
      name: 'Credentials',
      credentials: {
        email: { label: "Email Address", type: "text", placeholder: "example@email.com" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {        
          const res = await axios({
            url: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/api/auth/users/signin`,
            method: "post",
            data: {...credentials}
          })
          return res.data
        } 
        catch (error) {
          console.error(error.message);
          if (error.response.data?.msg) {
            console.error(error.response.data.msg);
          }
          // Return null if user data could not be retrieved
          return null
        }      
      }
    }),
    Credentials({
      id: "verify",
      name: 'Verify',
      credentials: {
        code: { label: "Code", type: "text" },
        id: {  label: "Id", type: "text" }
      },
      async authorize(credentials, req) {
        try {        
          const res = await axios({
            url: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/api/auth/users/verify`,
            method: "post",
            data: {...credentials}
          })
          return res.data
        } 
        catch (error) {
          console.error(error.message);
          if (error.response.data?.msg) {
            console.error(error.response.data.msg);
          }
          // Return null if user data could not be retrieved
          return null
        }
      }
    }),
    GoogleProvider({
      id: "google",
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }), 
    GithubProvider({
      id: "github",
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      return true
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    },
    async jwt({ token, user, account, profile, isNewUser }) {

      if (account?.type === 'oauth') {       
        try {        
          const res = await axios({
            url: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/api/auth/users/oauth/signOauth`,
            method: "post",
            data: profile
          })

          token._id = res.data._id
          token.accountId = res.data.accountId
          token.verified = res.data.verified
          return token
        } 
        catch (error) {
          console.error(error.message);
          if (error.response.data?.msg) {
            console.error(error.response.data.msg);
          }
          return false
        } 
      }
      user?.hasOwnProperty('_id') ? token._id = user._id : null
      user?.hasOwnProperty('accountId') ? token.accountId = user.accountId : null
      user?.hasOwnProperty('verified') ? token.verified = user.verified : null
      return token
    },
    async session({ session, user, token }) {

      token?.hasOwnProperty('_id') ? session.user._id = token._id : null
      token?.hasOwnProperty('accountId') ? session.user.accountId = token.accountId : null
      token?.hasOwnProperty('verified') ? session.user.verified = token.verified : null
      return session
    }
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: true
      }    
    },
  }
   /*
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: false,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: false,
        sameSite: 'none',
        path: '/',
        secure: true
      }
    },
  }
  */
})