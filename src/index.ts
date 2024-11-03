import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import fetch from 'node-fetch'

// Types for our internal use
interface CreateUserRequest {
  username: string
  firstName?: string
  lastName?: string
  email: string
  password: string
}

interface ZitadelError {
  code: number
  message: string
  details?: unknown
}

// Simple logger
const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }))
  },
  error: (message: string, error?: unknown, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      ...meta
    }))
  }
}

// Map Zitadel error codes to user-friendly messages
const errorMessages = {
  3: {
    username: 'Username must be between 1 and 200 characters',
    email: 'Email must be a valid email address',
    password: 'Password must meet the minimum requirements'
  }
} as const

// Format Zitadel error into user-friendly message
function formatZitadelError(error: ZitadelError): string {
  // Extract the field name from the error message
  const fieldMatch = error.message.match(/invalid AddHumanUserRequest\.(\w+):/)
  if (fieldMatch?.[1]) {
    const field = fieldMatch[1].toLowerCase()
    if (error.code === 3 && field in errorMessages[3]) {
      return errorMessages[3][field as keyof typeof errorMessages[3]]
    }
  }
  return 'Failed to create user. Please check your input and try again.'
}

// Environment variables configuration
const config = {
  ZITADEL_DOMAIN: process.env.ZITADEL_DOMAIN || 'https://your-instance.zitadel.cloud',
  ZITADEL_PAT: process.env.ZITADEL_PAT || 'your-personal-access-token',
  PORT: process.env.PORT || 3000
}

// Create Zitadel user using PAT
async function createZitadelUser(userData: CreateUserRequest) {
  logger.info('Creating new user in Zitadel', { username: userData.username, email: userData.email })
  
  // Local validation before making the API call
  if (!userData.username?.trim()) {
    throw new Error('Username is required')
  }
  
  if (userData.username.length > 200) {
    throw new Error('Username must be less than 200 characters')
  }
  
  try {
    const response = await fetch(`${config.ZITADEL_DOMAIN}/management/v1/users/human`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.ZITADEL_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: userData.username, // Note: Changed to match Zitadel's API expectations
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        email: {
          email: userData.email,
          isEmailVerified: false,
        },
        password: userData.password,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      logger.error('Failed to create user in Zitadel', responseData, {
        username: userData.username,
        email: userData.email,
        statusCode: response.status
      })
      
      // Handle Zitadel error
      const zitadelError = responseData as ZitadelError
      throw new Error(formatZitadelError(zitadelError))
    }

    logger.info('Successfully created user in Zitadel', {
      username: userData.username,
      email: userData.email,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      userId: (responseData as any).id
    })

    return responseData
  } catch (error) {
    logger.error('Error creating user', error, {
      username: userData.username,
      email: userData.email
    })
    throw error
  }
}

// Create our Elysia app
const app = new Elysia()
  .use(swagger())
  .post(
    '/users',
    async ({ body }) => {
      try {
        const user = await createZitadelUser(body as CreateUserRequest)
        return {
          status: 'success',
          data: user
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    },
    {
      body: t.Object({
        username: t.String({
          minLength: 1,
          maxLength: 200
        }),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        email: t.String({
          format: 'email'
        }),
        password: t.String({
          minLength: 8
        })
      }),
      detail: {
        tags: ['Users'],
        description: 'Create a new user in Zitadel'
      }
    }
  )
  .onStart(() => {
    logger.info('Server starting', { port: config.PORT })
  })
  .listen(config.PORT)

logger.info('Server initialized', {
  port: config.PORT,
  env: process.env.NODE_ENV || 'development'
})

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
