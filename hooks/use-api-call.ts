import { useCallback, useEffect, useReducer, useRef } from 'react'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  url?: string
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiOptions {
  method?: HttpMethod
  headers?: HeadersInit
  body?: BodyInit | object
  isProxy?: boolean
}

interface ApiState<T> {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: T | null
  error: string | null
  url: string | null
}

type ApiAction<T> =
  | { type: 'REQUEST_START'; payload: { url: string } }
  | { type: 'REQUEST_SUCCESS'; payload: { data: T } }
  | { type: 'REQUEST_FAILURE'; payload: { error: string } }
  | { type: 'RESET'  }

// Type for HTML response content
interface HtmlResponse {
  type: 'html'
  content: string
  message: string
}

// Type guard for error response objects
interface ErrorResponse {
  error?: string
  message?: string
}

function isErrorResponse(data: unknown): data is ErrorResponse {
  return typeof data === 'object' && data !== null && ('error' in data || 'message' in data)
}

// Lazy initializer for useReducer - avoids recreating initial state object on every render
const createInitialState = <T>(): ApiState<T> => ({
  status: 'idle',
  data: null,
  error: null,
  url: null,
})

function apiReducer<T>(state: ApiState<T>, action: ApiAction<T>): ApiState<T> {
  switch (action.type) {
    case 'REQUEST_START':
      return { ...state, status: 'loading', error: null, url: action.payload.url }
    case 'REQUEST_SUCCESS':
      return { ...state, status: 'success', data: action.payload.data, error: null }
    case 'REQUEST_FAILURE':
      return { ...state, status: 'error', error: action.payload.error, data: null }
    case 'RESET':
      return createInitialState<T>()
    default:
      return state
  }
}

export function useApiCall<T = unknown>() {
  const [state, dispatch] = useReducer(apiReducer<T>, null, createInitialState<T>)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount - abort any pending request to prevent memory leaks
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const execute = useCallback(async (url: string, options: ApiOptions = {}): Promise<T | null> => {
    // Cancel any pending request
    abortControllerRef.current?.abort()

    // Create new AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    dispatch({ type: 'REQUEST_START', payload: { url } })

    const { method = 'GET', headers = {}, body, isProxy = false } = options

    try {
      // Validate URL first
      try {
        new URL(url)
      } catch {
        throw new Error('Invalid URL provided')
      }

      const targetUrl = isProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url

      const fetchOptions: RequestInit = {
        method,
        headers: {
          Accept: 'application/json, text/html, */*',
          ...headers,
        },
        signal: abortController.signal,
      }

      if (body) {
        if (
          typeof body === 'object' &&
          !(body instanceof FormData) &&
          !(body instanceof URLSearchParams) &&
          !(body instanceof Blob)
        ) {
          fetchOptions.body = JSON.stringify(body)
          ;(fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json'
        } else {
          fetchOptions.body = body as BodyInit
        }
      }

      const response = await fetch(targetUrl, fetchOptions)

      if (abortController.signal.aborted) return null

      // Proxy response handling (assumes proxy returns ApiResponse structure)
      if (isProxy) {
        const proxyResponse: ApiResponse<T> = await response.json()
        if (!abortController.signal.aborted) {
          if (proxyResponse.success && proxyResponse.data !== undefined) {
            dispatch({ type: 'REQUEST_SUCCESS', payload: { data: proxyResponse.data } })
            return proxyResponse.data
          } else {
            dispatch({
              type: 'REQUEST_FAILURE',
              payload: { error: proxyResponse.error ?? 'Proxy request failed' },
            })
          }
        }
        return null
      }

      // Direct response handling with proper typing
      const contentType = response.headers.get('content-type') ?? ''
      let data: T | HtmlResponse | string

      if (contentType.includes('application/json')) {
        data = (await response.json()) as T
      } else if (contentType.includes('text/html')) {
        const html = await response.text()
        data = {
          type: 'html',
          content: html,
          message: 'This endpoint returns an HTML checkout page. Open the URL in a new tab to view it.',
        } satisfies HtmlResponse
      } else {
        data = await response.text()
      }

      if (!abortController.signal.aborted) {
        if (response.ok) {
          dispatch({ type: 'REQUEST_SUCCESS', payload: { data: data as T } })
          return data as T
        } else {
          // Try to get error message from response with type-safe check
          const errorMessage =
            typeof data === 'string'
              ? data
              : isErrorResponse(data)
                ? (data.error ?? data.message ?? `Request failed with status ${response.status}`)
                : `Request failed with status ${response.status}`
          dispatch({ type: 'REQUEST_FAILURE', payload: { error: errorMessage } })
        }
      }
      return null
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return null

      if (!abortController.signal.aborted) {
        dispatch({
          type: 'REQUEST_FAILURE',
          payload: { error: error instanceof Error ? error.message : 'An unknown error occurred' },
        })
      }
      return null
    }
  }, [])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    dispatch({ type: 'RESET' })
  }, [])

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  }
}
