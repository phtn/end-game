# useApiCall Hook

A type-safe, performant React hook for making API calls with built-in state management, request cancellation, and error handling.

## Features

- **Type-safe** - Full TypeScript support with generics
- **Request cancellation** - Automatically cancels pending requests when a new one is made or component unmounts
- **State management** - Built-in loading, success, and error states via `useReducer`
- **Proxy support** - Route requests through a proxy endpoint
- **Content-type handling** - Automatically handles JSON, HTML, and text responses

---

## Installation

The hook is located at `hooks/use-api-call.ts`. Import it directly:

```tsx
import { useApiCall } from '@/hooks/use-api-call'
```

---

## API Reference

### `useApiCall<T>()`

Returns an object with state and methods for making API calls.

#### Type Parameter

| Parameter | Description |
|-----------|-------------|
| `T` | The expected response data type. Defaults to `unknown`. |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `status` | `'idle' \| 'loading' \| 'success' \| 'error'` | Current request status |
| `data` | `T \| null` | Response data when successful |
| `error` | `string \| null` | Error message when request fails |
| `url` | `string \| null` | The URL of the current/last request |
| `isLoading` | `boolean` | `true` when status is `'loading'` |
| `isSuccess` | `boolean` | `true` when status is `'success'` |
| `isError` | `boolean` | `true` when status is `'error'` |
| `execute` | `(url: string, options?: ApiOptions) => Promise<T \| null>` | Execute an API request |
| `reset` | `() => void` | Reset state to initial values and cancel pending requests |

---

### `ApiOptions`

Options for the `execute` function.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'PATCH'` | `'GET'` | HTTP method |
| `headers` | `HeadersInit` | `{}` | Custom headers |
| `body` | `BodyInit \| object` | `undefined` | Request body (auto-stringified for objects) |
| `isProxy` | `boolean` | `false` | Route through `/api/proxy` endpoint |

---

### `ApiResponse<T>`

The expected response structure when using proxy mode.

```tsx
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  url?: string
}
```

---

## Usage Examples

### Basic GET Request

```tsx
import { useApiCall } from '@/hooks/use-api-call'

interface User {
  id: number
  name: string
  email: string
}

function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, isError, error, execute } = useApiCall<User>()

  const fetchUser = () => {
    execute(`https://api.example.com/users/${userId}`)
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error}</div>

  return (
    <div>
      {data && (
        <>
          <h1>{data.name}</h1>
          <p>{data.email}</p>
        </>
      )}
      <button onClick={fetchUser}>Fetch User</button>
    </div>
  )
}
```

### POST Request with Body

```tsx
import { useApiCall } from '@/hooks/use-api-call'

interface CreatePostResponse {
  id: number
  title: string
  createdAt: string
}

function CreatePost() {
  const { execute, isLoading, isSuccess, data } = useApiCall<CreatePostResponse>()

  const handleSubmit = async (title: string, content: string) => {
    const result = await execute('https://api.example.com/posts', {
      method: 'POST',
      body: { title, content },
    })

    if (result) {
      console.log('Post created with ID:', result.id)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit(
        formData.get('title') as string,
        formData.get('content') as string
      )
    }}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Post'}
      </button>
      {isSuccess && <p>Post created: {data?.title}</p>}
    </form>
  )
}
```

### Using with Custom Headers (Authentication)

```tsx
import { useApiCall } from '@/hooks/use-api-call'

interface ProtectedData {
  secret: string
}

function ProtectedResource() {
  const { execute, data, isLoading } = useApiCall<ProtectedData>()

  const fetchProtectedData = () => {
    execute('https://api.example.com/protected', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  }

  return (
    <div>
      <button onClick={fetchProtectedData} disabled={isLoading}>
        Fetch Protected Data
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
```

### Using Proxy Mode

When you need to avoid CORS issues or route requests through your backend:

```tsx
import { useApiCall } from '@/hooks/use-api-call'

interface ExternalApiData {
  results: string[]
}

function ExternalApiComponent() {
  const { execute, data, isLoading, error } = useApiCall<ExternalApiData>()

  const fetchExternalData = () => {
    // Request will be routed through /api/proxy?url=...
    execute('https://external-api.com/data', {
      isProxy: true,
    })
  }

  return (
    <div>
      <button onClick={fetchExternalData}>Fetch External Data</button>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && (
        <ul>
          {data.results.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Handling Multiple Request States

```tsx
import { useApiCall } from '@/hooks/use-api-call'

interface Product {
  id: number
  name: string
  price: number
}

function ProductManager() {
  const fetchApi = useApiCall<Product[]>()
  const deleteApi = useApiCall<{ success: boolean }>()

  const loadProducts = () => {
    fetchApi.execute('https://api.example.com/products')
  }

  const deleteProduct = async (id: number) => {
    const result = await deleteApi.execute(`https://api.example.com/products/${id}`, {
      method: 'DELETE',
    })

    if (result?.success) {
      // Refresh the list
      loadProducts()
    }
  }

  return (
    <div>
      <button onClick={loadProducts} disabled={fetchApi.isLoading}>
        {fetchApi.isLoading ? 'Loading...' : 'Load Products'}
      </button>

      {fetchApi.data?.map((product) => (
        <div key={product.id}>
          <span>{product.name} - ${product.price}</span>
          <button
            onClick={() => deleteProduct(product.id)}
            disabled={deleteApi.isLoading}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Using the Return Value from Execute

The `execute` function returns a `Promise<T | null>`, allowing you to use the result directly:

```tsx
import { useApiCall } from '@/hooks/use-api-call'

interface LoginResponse {
  token: string
  user: { id: number; name: string }
}

function LoginForm() {
  const { execute, isLoading, error } = useApiCall<LoginResponse>()

  const handleLogin = async (email: string, password: string) => {
    const result = await execute('https://api.example.com/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    if (result) {
      // Use the result immediately without waiting for state update
      localStorage.setItem('token', result.token)
      window.location.href = '/dashboard'
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      )
    }}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
```

### Resetting State

```tsx
import { useApiCall } from '@/hooks/use-api-call'

function SearchComponent() {
  const { execute, data, reset, isLoading, status } = useApiCall<string[]>()

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      reset() // Clear previous results
      return
    }
    execute(`https://api.example.com/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div>
      <input
        type="text"
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={reset}>Clear</button>

      {status === 'idle' && <p>Enter a search term</p>}
      {isLoading && <p>Searching...</p>}
      {data && (
        <ul>
          {data.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## Best Practices

### 1. Always specify the generic type

```tsx
// ✅ Good - Type-safe
const { data } = useApiCall<User>()

// ❌ Avoid - data will be `unknown`
const { data } = useApiCall()
```

### 2. Handle all states

```tsx
// ✅ Good - Handles all states
if (isLoading) return <Spinner />
if (isError) return <ErrorMessage error={error} />
if (!data) return <EmptyState />
return <DataDisplay data={data} />
```

### 3. Use the return value for immediate actions

```tsx
// ✅ Good - Use result immediately
const result = await execute('/api/create')
if (result) {
  router.push(`/item/${result.id}`)
}

// ❌ Avoid - Waiting for state update
await execute('/api/create')
if (data) { // data might not be updated yet
  router.push(`/item/${data.id}`)
}
```

### 4. Reset when needed

```tsx
// Reset on component cleanup or when switching contexts
useEffect(() => {
  return () => reset()
}, [reset])
```

---

## Notes

- **Automatic request cancellation**: When `execute` is called while a previous request is pending, the previous request is automatically cancelled.
- **Unmount safety**: Pending requests are cancelled when the component unmounts, preventing memory leaks and state updates on unmounted components.
- **JSON body handling**: When passing an object as `body`, it's automatically stringified and the `Content-Type` header is set to `application/json`.
- **HTML response handling**: HTML responses are wrapped in a structured object with `type: 'html'`, `content`, and `message` properties.
