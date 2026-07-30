// Shape of the sealed-cookie session for nuxt-auth-utils.
declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string | null
    image: string | null
  }

  interface UserSession {
    user: User
  }
}

export {}
