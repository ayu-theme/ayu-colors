export interface CodeSample {
  code: string
  lang: string
  label: string
}

export const CODE_SAMPLES: Record<string, CodeSample> = {
  typescript: {
    label: 'TypeScript',
    lang: 'typescript',
    code: `import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode, CSSProperties, KeyboardEvent } from 'react'

/**
 * Configuration options for the modal component.
 * Supports custom styling, animations, and accessibility features.
 */
export interface ModalConfig {
  /** Unique identifier for the modal instance */
  id: string
  /** Modal title displayed in the header */
  title: string
  /** Optional description for screen readers */
  description?: string
  /** Whether the modal can be closed by clicking outside */
  closeOnOverlayClick?: boolean
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Custom z-index for stacking context */
  zIndex?: number
  /** Animation duration in milliseconds */
  animationDuration?: number
}

export interface ModalProps extends ModalConfig {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  style?: CSSProperties
}

type ModalSize = NonNullable<ModalProps['size']>

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
}

const ANIMATION_STATES = {
  entering: { opacity: 0, transform: 'scale(0.95)' },
  entered: { opacity: 1, transform: 'scale(1)' },
  exiting: { opacity: 0, transform: 'scale(0.95)' },
} as const

/**
 * A fully accessible modal dialog component.
 *
 * @example
 * \`\`\`tsx
 * <Modal
 *   id="confirm-dialog"
 *   title="Confirm Action"
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 * \`\`\`
 */
export function Modal({
  id,
  title,
  description,
  isOpen,
  onClose,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  zIndex = 1000,
  animationDuration = 200,
  className = '',
  style,
}: ModalProps) {
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting'>('entering')
  const [shouldRender, setShouldRender] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setShouldRender(true)
      setAnimationState('entering')

      const timer = setTimeout(() => {
        setAnimationState('entered')
        modalRef.current?.focus()
      }, 10)

      return () => clearTimeout(timer)
    } else if (shouldRender) {
      setAnimationState('exiting')

      const timer = setTimeout(() => {
        setShouldRender(false)
        previousActiveElement.current?.focus()
      }, animationDuration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, animationDuration, shouldRender])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose()
      }
    },
    [closeOnOverlayClick, onClose]
  )

  // Compute animation styles
  const animationStyles = useMemo(
    () => ({
      ...ANIMATION_STATES[animationState],
      transition: \`opacity \${animationDuration}ms ease, transform \${animationDuration}ms ease\`,
    }),
    [animationState, animationDuration]
  )

  if (!shouldRender) {
    return null
  }

  const sizeClass = SIZE_CLASSES[size]

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      onClick={handleOverlayClick}
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{
          opacity: animationState === 'entered' ? 1 : 0,
          transition: \`opacity \${animationDuration}ms ease\`,
        }}
        aria-hidden="true"
      />

      {/* Modal dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={\`\${id}-title\`}
        aria-describedby={description ? \`\${id}-description\` : undefined}
        tabIndex={-1}
        className={\`relative w-full \${sizeClass} bg-white dark:bg-gray-900 rounded-lg shadow-xl \${className}\`}
        style={{ ...animationStyles, ...style }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id={\`\${id}-title\`} className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </header>

        {/* Description for accessibility */}
        {description && (
          <p id={\`\${id}-description\`} className="sr-only">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  )
}

// Re-export types for consumers
export type { ReactNode, CSSProperties }`,
  },

  python: {
    label: 'Python',
    lang: 'python',
    code: `"""
HTTP client with automatic retries, rate limiting, and caching.

This module provides a robust HTTP client implementation that handles
common production concerns like retries, rate limiting, and response caching.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from functools import wraps
from typing import (
    Any,
    Callable,
    Dict,
    Generic,
    List,
    Optional,
    Protocol,
    TypeVar,
    Union,
)

import aiohttp
from aiohttp import ClientSession, ClientTimeout

logger = logging.getLogger(__name__)

T = TypeVar("T")
R = TypeVar("R", covariant=True)


class HttpMethod(Enum):
    """Supported HTTP methods."""

    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


@dataclass(frozen=True)
class CacheKey:
    """Immutable cache key for HTTP requests."""

    method: HttpMethod
    url: str
    params_hash: str

    @classmethod
    def from_request(
        cls,
        method: HttpMethod,
        url: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> CacheKey:
        """Create a cache key from request parameters."""
        params_str = json.dumps(params or {}, sort_keys=True)
        params_hash = hashlib.sha256(params_str.encode()).hexdigest()[:16]
        return cls(method=method, url=url, params_hash=params_hash)


@dataclass
class CacheEntry(Generic[T]):
    """A cached response with expiration tracking."""

    value: T
    created_at: datetime = field(default_factory=datetime.utcnow)
    ttl_seconds: int = 300

    @property
    def is_expired(self) -> bool:
        """Check if this cache entry has expired."""
        age = datetime.utcnow() - self.created_at
        return age > timedelta(seconds=self.ttl_seconds)


class Cache(Protocol[T]):
    """Protocol for cache implementations."""

    async def get(self, key: CacheKey) -> Optional[T]:
        """Retrieve a value from cache."""
        ...

    async def set(self, key: CacheKey, value: T, ttl: int = 300) -> None:
        """Store a value in cache."""
        ...

    async def delete(self, key: CacheKey) -> None:
        """Remove a value from cache."""
        ...


class InMemoryCache(Generic[T]):
    """Simple in-memory cache implementation."""

    def __init__(self, max_size: int = 1000) -> None:
        self._cache: Dict[CacheKey, CacheEntry[T]] = {}
        self._max_size = max_size
        self._lock = asyncio.Lock()

    async def get(self, key: CacheKey) -> Optional[T]:
        """Retrieve a value from cache if not expired."""
        async with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return None
            if entry.is_expired:
                del self._cache[key]
                return None
            return entry.value

    async def set(self, key: CacheKey, value: T, ttl: int = 300) -> None:
        """Store a value in cache with TTL."""
        async with self._lock:
            # Evict oldest entries if at capacity
            if len(self._cache) >= self._max_size:
                oldest_key = min(
                    self._cache.keys(),
                    key=lambda k: self._cache[k].created_at,
                )
                del self._cache[oldest_key]

            self._cache[key] = CacheEntry(value=value, ttl_seconds=ttl)

    async def delete(self, key: CacheKey) -> None:
        """Remove a value from cache."""
        async with self._lock:
            self._cache.pop(key, None)


@dataclass
class RateLimiter:
    """Token bucket rate limiter."""

    requests_per_second: float
    burst_size: int = 10

    _tokens: float = field(init=False)
    _last_update: float = field(init=False)
    _lock: asyncio.Lock = field(default_factory=asyncio.Lock, init=False)

    def __post_init__(self) -> None:
        self._tokens = float(self.burst_size)
        self._last_update = time.monotonic()

    async def acquire(self) -> None:
        """Wait until a request token is available."""
        async with self._lock:
            while True:
                now = time.monotonic()
                elapsed = now - self._last_update
                self._tokens = min(
                    self.burst_size,
                    self._tokens + elapsed * self.requests_per_second,
                )
                self._last_update = now

                if self._tokens >= 1.0:
                    self._tokens -= 1.0
                    return

                wait_time = (1.0 - self._tokens) / self.requests_per_second
                await asyncio.sleep(wait_time)


@dataclass
class RetryConfig:
    """Configuration for retry behavior."""

    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 60.0
    exponential_base: float = 2.0
    retryable_status_codes: tuple[int, ...] = (429, 500, 502, 503, 504)

    def get_delay(self, attempt: int) -> float:
        """Calculate delay for a given retry attempt using exponential backoff."""
        delay = self.base_delay * (self.exponential_base ** attempt)
        return min(delay, self.max_delay)


class HttpClientError(Exception):
    """Base exception for HTTP client errors."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        response_body: Optional[str] = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


class HttpClient:
    """
    Production-ready HTTP client with retries, rate limiting, and caching.

    Example usage:
        async with HttpClient(base_url="https://api.example.com") as client:
            response = await client.get("/users/123")
            print(response)
    """

    def __init__(
        self,
        base_url: str,
        *,
        timeout: float = 30.0,
        retry_config: Optional[RetryConfig] = None,
        rate_limiter: Optional[RateLimiter] = None,
        cache: Optional[Cache[Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = ClientTimeout(total=timeout)
        self.retry_config = retry_config or RetryConfig()
        self.rate_limiter = rate_limiter
        self.cache = cache
        self.default_headers = headers or {}
        self._session: Optional[ClientSession] = None

    async def __aenter__(self) -> HttpClient:
        """Create the aiohttp session."""
        self._session = ClientSession(
            timeout=self.timeout,
            headers=self.default_headers,
        )
        return self

    async def __aexit__(self, *args: Any) -> None:
        """Close the aiohttp session."""
        if self._session:
            await self._session.close()
            self._session = None

    async def request(
        self,
        method: HttpMethod,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        use_cache: bool = True,
    ) -> Any:
        """Make an HTTP request with retries and optional caching."""
        if self._session is None:
            raise RuntimeError("Client not initialized. Use 'async with' context.")

        url = f"{self.base_url}/{path.lstrip('/')}"

        # Check cache for GET requests
        cache_key = CacheKey.from_request(method, url, params)
        if use_cache and method == HttpMethod.GET and self.cache:
            cached = await self.cache.get(cache_key)
            if cached is not None:
                logger.debug(f"Cache hit for {url}")
                return cached

        # Apply rate limiting
        if self.rate_limiter:
            await self.rate_limiter.acquire()

        # Execute request with retries
        last_error: Optional[Exception] = None
        for attempt in range(self.retry_config.max_retries + 1):
            try:
                async with self._session.request(
                    method.value,
                    url,
                    params=params,
                    json=json_body,
                    headers=headers,
                ) as response:
                    if response.status >= 400:
                        body = await response.text()
                        if response.status in self.retry_config.retryable_status_codes:
                            raise HttpClientError(
                                f"Request failed with status {response.status}",
                                status_code=response.status,
                                response_body=body,
                            )
                        raise HttpClientError(
                            f"Request failed: {body}",
                            status_code=response.status,
                            response_body=body,
                        )

                    result = await response.json()

                    # Cache successful GET responses
                    if method == HttpMethod.GET and self.cache:
                        await self.cache.set(cache_key, result)

                    return result

            except (aiohttp.ClientError, HttpClientError) as e:
                last_error = e
                if attempt < self.retry_config.max_retries:
                    delay = self.retry_config.get_delay(attempt)
                    logger.warning(
                        f"Request to {url} failed (attempt {attempt + 1}), "
                        f"retrying in {delay:.1f}s: {e}"
                    )
                    await asyncio.sleep(delay)

        raise last_error or HttpClientError("Request failed after retries")

    async def get(self, path: str, **kwargs: Any) -> Any:
        """Make a GET request."""
        return await self.request(HttpMethod.GET, path, **kwargs)

    async def post(self, path: str, **kwargs: Any) -> Any:
        """Make a POST request."""
        return await self.request(HttpMethod.POST, path, **kwargs)

    async def put(self, path: str, **kwargs: Any) -> Any:
        """Make a PUT request."""
        return await self.request(HttpMethod.PUT, path, **kwargs)

    async def delete(self, path: str, **kwargs: Any) -> Any:
        """Make a DELETE request."""
        return await self.request(HttpMethod.DELETE, path, **kwargs)`,
  },

  rust: {
    label: 'Rust',
    lang: 'rust',
    code: `//! A thread-safe, in-memory cache with TTL support and LRU eviction.
//!
//! This module provides a production-ready cache implementation that can be
//! used across multiple threads safely.

use std::collections::HashMap;
use std::hash::Hash;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};

use thiserror::Error;

/// Errors that can occur during cache operations.
#[derive(Debug, Error)]
pub enum CacheError {
    #[error("Cache is at maximum capacity")]
    CapacityExceeded,

    #[error("Failed to acquire lock: {0}")]
    LockError(String),

    #[error("Key not found in cache")]
    KeyNotFound,
}

/// Result type for cache operations.
pub type CacheResult<T> = Result<T, CacheError>;

/// Configuration options for the cache.
#[derive(Debug, Clone)]
pub struct CacheConfig {
    /// Maximum number of entries in the cache.
    pub max_capacity: usize,
    /// Default time-to-live for cache entries.
    pub default_ttl: Duration,
    /// Whether to update TTL on access.
    pub refresh_on_access: bool,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            max_capacity: 10_000,
            default_ttl: Duration::from_secs(300),
            refresh_on_access: false,
        }
    }
}

impl CacheConfig {
    /// Create a new cache configuration with custom capacity.
    pub fn with_capacity(max_capacity: usize) -> Self {
        Self {
            max_capacity,
            ..Default::default()
        }
    }

    /// Set the default TTL for entries.
    pub fn with_ttl(mut self, ttl: Duration) -> Self {
        self.default_ttl = ttl;
        self
    }

    /// Enable refreshing TTL on access.
    pub fn with_refresh_on_access(mut self) -> Self {
        self.refresh_on_access = true;
        self
    }
}

/// A single entry in the cache with expiration tracking.
#[derive(Debug, Clone)]
struct CacheEntry<V> {
    value: V,
    created_at: Instant,
    last_accessed: Instant,
    ttl: Duration,
}

impl<V> CacheEntry<V> {
    fn new(value: V, ttl: Duration) -> Self {
        let now = Instant::now();
        Self {
            value,
            created_at: now,
            last_accessed: now,
            ttl,
        }
    }

    fn is_expired(&self) -> bool {
        self.created_at.elapsed() > self.ttl
    }

    fn touch(&mut self) {
        self.last_accessed = Instant::now();
    }
}

/// A thread-safe cache with TTL support and LRU eviction.
///
/// # Examples
///
/// \`\`\`rust
/// use std::time::Duration;
///
/// let cache = Cache::new(CacheConfig::default());
///
/// // Insert a value
/// cache.insert("key", "value").unwrap();
///
/// // Retrieve a value
/// if let Some(value) = cache.get(&"key") {
///     println!("Found: {}", value);
/// }
///
/// // Insert with custom TTL
/// cache.insert_with_ttl("temp", "data", Duration::from_secs(60)).unwrap();
/// \`\`\`
#[derive(Debug)]
pub struct Cache<K, V>
where
    K: Eq + Hash + Clone,
    V: Clone,
{
    entries: Arc<RwLock<HashMap<K, CacheEntry<V>>>>,
    config: CacheConfig,
}

impl<K, V> Cache<K, V>
where
    K: Eq + Hash + Clone,
    V: Clone,
{
    /// Create a new cache with the given configuration.
    pub fn new(config: CacheConfig) -> Self {
        Self {
            entries: Arc::new(RwLock::new(HashMap::with_capacity(config.max_capacity))),
            config,
        }
    }

    /// Create a new cache with default configuration.
    pub fn with_defaults() -> Self {
        Self::new(CacheConfig::default())
    }

    /// Get a value from the cache.
    ///
    /// Returns \`None\` if the key doesn't exist or the entry has expired.
    pub fn get(&self, key: &K) -> Option<V> {
        // First, try a read lock for the common case
        {
            let entries = self.entries.read().ok()?;
            if let Some(entry) = entries.get(key) {
                if !entry.is_expired() {
                    return Some(entry.value.clone());
                }
            }
        }

        // If refresh_on_access is enabled or entry is expired, use write lock
        if self.config.refresh_on_access {
            let mut entries = self.entries.write().ok()?;
            if let Some(entry) = entries.get_mut(key) {
                if entry.is_expired() {
                    entries.remove(key);
                    return None;
                }
                entry.touch();
                return Some(entry.value.clone());
            }
        }

        None
    }

    /// Insert a value into the cache with the default TTL.
    pub fn insert(&self, key: K, value: V) -> CacheResult<()> {
        self.insert_with_ttl(key, value, self.config.default_ttl)
    }

    /// Insert a value into the cache with a custom TTL.
    pub fn insert_with_ttl(&self, key: K, value: V, ttl: Duration) -> CacheResult<()> {
        let mut entries = self
            .entries
            .write()
            .map_err(|e| CacheError::LockError(e.to_string()))?;

        // Evict expired entries if at capacity
        if entries.len() >= self.config.max_capacity && !entries.contains_key(&key) {
            self.evict_expired(&mut entries);

            // If still at capacity, evict LRU entry
            if entries.len() >= self.config.max_capacity {
                self.evict_lru(&mut entries);
            }
        }

        let entry = CacheEntry::new(value, ttl);
        entries.insert(key, entry);
        Ok(())
    }

    /// Remove a value from the cache.
    pub fn remove(&self, key: &K) -> CacheResult<Option<V>> {
        let mut entries = self
            .entries
            .write()
            .map_err(|e| CacheError::LockError(e.to_string()))?;

        Ok(entries.remove(key).map(|e| e.value))
    }

    /// Check if a key exists in the cache (and is not expired).
    pub fn contains_key(&self, key: &K) -> bool {
        self.get(key).is_some()
    }

    /// Get the current number of entries in the cache.
    pub fn len(&self) -> usize {
        self.entries.read().map(|e| e.len()).unwrap_or(0)
    }

    /// Check if the cache is empty.
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// Clear all entries from the cache.
    pub fn clear(&self) -> CacheResult<()> {
        let mut entries = self
            .entries
            .write()
            .map_err(|e| CacheError::LockError(e.to_string()))?;

        entries.clear();
        Ok(())
    }

    /// Remove all expired entries from the cache.
    pub fn cleanup(&self) -> CacheResult<usize> {
        let mut entries = self
            .entries
            .write()
            .map_err(|e| CacheError::LockError(e.to_string()))?;

        let before = entries.len();
        self.evict_expired(&mut entries);
        Ok(before - entries.len())
    }

    /// Evict all expired entries.
    fn evict_expired(&self, entries: &mut HashMap<K, CacheEntry<V>>) {
        entries.retain(|_, entry| !entry.is_expired());
    }

    /// Evict the least recently used entry.
    fn evict_lru(&self, entries: &mut HashMap<K, CacheEntry<V>>) {
        if let Some(lru_key) = entries
            .iter()
            .min_by_key(|(_, entry)| entry.last_accessed)
            .map(|(key, _)| key.clone())
        {
            entries.remove(&lru_key);
        }
    }
}

impl<K, V> Clone for Cache<K, V>
where
    K: Eq + Hash + Clone,
    V: Clone,
{
    fn clone(&self) -> Self {
        Self {
            entries: Arc::clone(&self.entries),
            config: self.config.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_and_get() {
        let cache = Cache::with_defaults();
        cache.insert("key", "value").unwrap();
        assert_eq!(cache.get(&"key"), Some("value"));
    }

    #[test]
    fn test_expiration() {
        let config = CacheConfig::default().with_ttl(Duration::from_millis(10));
        let cache = Cache::new(config);

        cache.insert("key", "value").unwrap();
        std::thread::sleep(Duration::from_millis(20));
        assert_eq!(cache.get(&"key"), None);
    }

    #[test]
    fn test_lru_eviction() {
        let config = CacheConfig::with_capacity(2);
        let cache = Cache::new(config);

        cache.insert("a", 1).unwrap();
        cache.insert("b", 2).unwrap();
        cache.get(&"a"); // Access "a" to make it more recent
        cache.insert("c", 3).unwrap(); // Should evict "b"

        assert!(cache.contains_key(&"a"));
        assert!(!cache.contains_key(&"b"));
        assert!(cache.contains_key(&"c"));
    }
}`,
  },

  go: {
    label: 'Go',
    lang: 'go',
    code: `// Package server provides an HTTP server with middleware support,
// graceful shutdown, and structured logging.
package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime/debug"
	"sync"
	"syscall"
	"time"
)

// Config holds server configuration options.
type Config struct {
	// Host is the address to bind to.
	Host string
	// Port is the port to listen on.
	Port int
	// ReadTimeout is the maximum duration for reading the request.
	ReadTimeout time.Duration
	// WriteTimeout is the maximum duration for writing the response.
	WriteTimeout time.Duration
	// ShutdownTimeout is the maximum duration to wait for graceful shutdown.
	ShutdownTimeout time.Duration
}

// DefaultConfig returns a Config with sensible defaults.
func DefaultConfig() Config {
	return Config{
		Host:            "0.0.0.0",
		Port:            8080,
		ReadTimeout:     15 * time.Second,
		WriteTimeout:    15 * time.Second,
		ShutdownTimeout: 30 * time.Second,
	}
}

// Middleware is a function that wraps an http.Handler.
type Middleware func(http.Handler) http.Handler

// Server is an HTTP server with middleware support.
type Server struct {
	config     Config
	logger     *slog.Logger
	router     *http.ServeMux
	middleware []Middleware
	server     *http.Server
	mu         sync.RWMutex
	running    bool
}

// New creates a new Server with the given configuration.
func New(config Config, logger *slog.Logger) *Server {
	if logger == nil {
		logger = slog.New(slog.NewJSONHandler(os.Stdout, nil))
	}

	return &Server{
		config:     config,
		logger:     logger,
		router:     http.NewServeMux(),
		middleware: make([]Middleware, 0),
	}
}

// Use adds middleware to the server.
func (s *Server) Use(mw ...Middleware) {
	s.middleware = append(s.middleware, mw...)
}

// Handle registers a handler for the given pattern.
func (s *Server) Handle(pattern string, handler http.Handler) {
	s.router.Handle(pattern, handler)
}

// HandleFunc registers a handler function for the given pattern.
func (s *Server) HandleFunc(pattern string, handler http.HandlerFunc) {
	s.router.HandleFunc(pattern, handler)
}

// Start starts the server and blocks until shutdown.
func (s *Server) Start(ctx context.Context) error {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return errors.New("server is already running")
	}
	s.running = true
	s.mu.Unlock()

	// Build the middleware chain
	var handler http.Handler = s.router
	for i := len(s.middleware) - 1; i >= 0; i-- {
		handler = s.middleware[i](handler)
	}

	addr := fmt.Sprintf("%s:%d", s.config.Host, s.config.Port)
	s.server = &http.Server{
		Addr:         addr,
		Handler:      handler,
		ReadTimeout:  s.config.ReadTimeout,
		WriteTimeout: s.config.WriteTimeout,
	}

	// Channel to receive server errors
	errCh := make(chan error, 1)

	// Start the server in a goroutine
	go func() {
		s.logger.Info("server starting", "addr", addr)
		if err := s.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	// Wait for shutdown signal or error
	select {
	case err := <-errCh:
		return fmt.Errorf("server error: %w", err)
	case <-ctx.Done():
		return s.Shutdown()
	}
}

// Shutdown gracefully shuts down the server.
func (s *Server) Shutdown() error {
	s.mu.Lock()
	if !s.running {
		s.mu.Unlock()
		return nil
	}
	s.running = false
	s.mu.Unlock()

	s.logger.Info("server shutting down")

	ctx, cancel := context.WithTimeout(context.Background(), s.config.ShutdownTimeout)
	defer cancel()

	if err := s.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("shutdown error: %w", err)
	}

	s.logger.Info("server stopped")
	return nil
}

// JSON response helpers

// Response represents a JSON API response.
type Response struct {
	Success bool        \`json:"success"\`
	Data    interface{} \`json:"data,omitempty"\`
	Error   *ErrorInfo  \`json:"error,omitempty"\`
}

// ErrorInfo contains error details for API responses.
type ErrorInfo struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
}

// WriteJSON writes a JSON response with the given status code.
func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	resp := Response{
		Success: status >= 200 && status < 300,
		Data:    data,
	}

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		slog.Error("failed to encode response", "error", err)
	}
}

// WriteError writes a JSON error response.
func WriteError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	resp := Response{
		Success: false,
		Error: &ErrorInfo{
			Code:    code,
			Message: message,
		},
	}

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		slog.Error("failed to encode error response", "error", err)
	}
}

// Middleware implementations

// LoggingMiddleware logs all requests.
func LoggingMiddleware(logger *slog.Logger) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Wrap response writer to capture status code
			wrapped := &responseWriter{ResponseWriter: w, status: http.StatusOK}

			next.ServeHTTP(wrapped, r)

			logger.Info("request completed",
				"method", r.Method,
				"path", r.URL.Path,
				"status", wrapped.status,
				"duration", time.Since(start),
				"remote_addr", r.RemoteAddr,
			)
		})
	}
}

// RecoveryMiddleware recovers from panics and returns a 500 error.
func RecoveryMiddleware(logger *slog.Logger) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					logger.Error("panic recovered",
						"error", err,
						"stack", string(debug.Stack()),
					)
					WriteError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "An internal error occurred")
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}

// CORSMiddleware adds CORS headers to responses.
func CORSMiddleware(allowedOrigins []string) Middleware {
	originSet := make(map[string]bool)
	for _, origin := range allowedOrigins {
		originSet[origin] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")

			if originSet["*"] || originSet[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
				w.Header().Set("Access-Control-Max-Age", "86400")
			}

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// responseWriter wraps http.ResponseWriter to capture the status code.
type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

// Main function example
func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	config := DefaultConfig()
	srv := New(config, logger)

	// Add middleware
	srv.Use(
		RecoveryMiddleware(logger),
		LoggingMiddleware(logger),
		CORSMiddleware([]string{"*"}),
	)

	// Register routes
	srv.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		WriteJSON(w, http.StatusOK, map[string]string{"status": "healthy"})
	})

	srv.HandleFunc("GET /api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		WriteJSON(w, http.StatusOK, map[string]string{"id": id, "name": "Alice"})
	})

	// Setup graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := srv.Start(ctx); err != nil {
		logger.Error("server error", "error", err)
		os.Exit(1)
	}
}`,
  },

  html: {
    label: 'HTML',
    lang: 'html',
    code: `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A modern task management application for teams and individuals">
  <meta name="theme-color" content="#6366f1">
  <meta property="og:title" content="TaskFlow - Modern Task Management">
  <meta property="og:description" content="Organize, track, and complete tasks with ease">
  <meta property="og:image" content="/images/og-image.png">
  <meta property="og:type" content="website">

  <title>TaskFlow &mdash; Modern Task Management</title>

  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="/styles/main.css">

  <script type="module" src="/scripts/app.js" defer></script>
</head>

<body class="antialiased bg-gray-50 dark:bg-gray-900">
  <!-- Skip to content link for accessibility -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md">
    Skip to main content
  </a>

  <!-- Header -->
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="flex items-center justify-between h-16" aria-label="Main navigation">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <svg class="w-8 h-8 text-indigo-600" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M16 2L4 8v16l12 6 12-6V8L16 2zm0 4l8 4-8 4-8-4 8-4z"/>
          </svg>
          <span>TaskFlow</span>
        </a>

        <!-- Desktop Navigation -->
        <ul class="hidden md:flex items-center gap-8">
          <li><a href="/features" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Features</a></li>
          <li><a href="/pricing" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Pricing</a></li>
          <li><a href="/docs" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Documentation</a></li>
          <li><a href="/blog" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Blog</a></li>
        </ul>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <button type="button" id="theme-toggle" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Toggle dark mode">
            <svg class="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <svg class="w-5 h-5 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </button>

          <a href="/login" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium">Sign in</a>
          <a href="/signup" class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            Get Started &rarr;
          </a>

          <!-- Mobile menu button -->
          <button type="button" id="mobile-menu-toggle" class="md:hidden p-2 text-gray-500" aria-expanded="false" aria-controls="mobile-menu">
            <span class="sr-only">Open menu</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </nav>
    </div>

    <!-- Mobile menu -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-800">
      <ul class="px-4 py-4 space-y-2">
        <li><a href="/features" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Features</a></li>
        <li><a href="/pricing" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Pricing</a></li>
        <li><a href="/docs" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Documentation</a></li>
        <li><a href="/blog" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Blog</a></li>
      </ul>
    </div>
  </header>

  <!-- Main Content -->
  <main id="main-content">
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 sm:py-32">
      <div class="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mb-6">
          <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          Version 2.0 is here!
        </span>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
          The smarter way to<br>
          <span class="text-indigo-600 dark:text-indigo-400">manage your tasks</span>
        </h1>

        <p class="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          TaskFlow helps teams and individuals organize, track, and complete tasks with ease.
          Built for productivity, designed for humans.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/signup" class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
            Start for free
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </a>
          <a href="/demo" class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <svg class="mr-2 w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
            </svg>
            Watch demo
          </a>
        </div>

        <!-- Trusted by -->
        <div class="mt-16">
          <p class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Trusted by teams at</p>
          <div class="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <img src="/logos/company-1.svg" alt="Company 1" class="h-8" width="120" height="32">
            <img src="/logos/company-2.svg" alt="Company 2" class="h-8" width="120" height="32">
            <img src="/logos/company-3.svg" alt="Company 3" class="h-8" width="120" height="32">
            <img src="/logos/company-4.svg" alt="Company 4" class="h-8" width="120" height="32">
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Everything you need to stay organized
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Powerful features that help you manage tasks efficiently.
          </p>
        </header>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature cards would go here -->
          <article class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Smart Lists</h3>
            <p class="text-gray-600 dark:text-gray-300">Automatically organize tasks based on due dates, priorities, and custom rules.</p>
          </article>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-400 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; 2024 TaskFlow, Inc. All rights reserved.</p>
        <nav class="flex gap-6">
          <a href="/privacy" class="hover:text-white transition-colors">Privacy</a>
          <a href="/terms" class="hover:text-white transition-colors">Terms</a>
          <a href="/contact" class="hover:text-white transition-colors">Contact</a>
        </nav>
      </div>
    </div>
  </footer>
</body>
</html>`,
  },

  css: {
    label: 'CSS',
    lang: 'css',
    code: `/**
 * TaskFlow Design System
 * A modern CSS architecture using custom properties,
 * container queries, and logical properties.
 */

/* ============================================
   Design Tokens
   ============================================ */

:root {
  /* Color palette */
  --color-primary-50: oklch(97% 0.02 265);
  --color-primary-100: oklch(93% 0.05 265);
  --color-primary-200: oklch(87% 0.08 265);
  --color-primary-300: oklch(78% 0.12 265);
  --color-primary-400: oklch(68% 0.16 265);
  --color-primary-500: oklch(55% 0.2 265);
  --color-primary-600: oklch(48% 0.2 265);
  --color-primary-700: oklch(40% 0.18 265);
  --color-primary-800: oklch(33% 0.15 265);
  --color-primary-900: oklch(27% 0.12 265);

  --color-gray-50: oklch(98% 0.005 265);
  --color-gray-100: oklch(96% 0.005 265);
  --color-gray-200: oklch(92% 0.005 265);
  --color-gray-300: oklch(87% 0.005 265);
  --color-gray-400: oklch(70% 0.01 265);
  --color-gray-500: oklch(55% 0.01 265);
  --color-gray-600: oklch(45% 0.01 265);
  --color-gray-700: oklch(37% 0.01 265);
  --color-gray-800: oklch(27% 0.01 265);
  --color-gray-900: oklch(20% 0.01 265);

  --color-success: oklch(65% 0.2 145);
  --color-warning: oklch(75% 0.15 85);
  --color-error: oklch(55% 0.22 25);

  /* Typography */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
  --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
  --text-lg: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-xl: clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem);
  --text-2xl: clamp(1.4rem, 1.2rem + 1vw, 1.5rem);
  --text-3xl: clamp(1.7rem, 1.4rem + 1.5vw, 1.875rem);
  --text-4xl: clamp(2rem, 1.6rem + 2vw, 2.25rem);

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Borders & Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  --border-width: 1px;
  --border-color: var(--color-gray-200);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Transitions */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);

  /* Z-index scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-toast: 500;
}

/* Dark mode tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --border-color: var(--color-gray-700);
  }
}

/* ============================================
   Base Styles
   ============================================ */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  min-block-size: 100dvh;
  background-color: var(--color-gray-50);
  color: var(--color-gray-900);
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: var(--color-gray-900);
    color: var(--color-gray-100);
  }
}

/* ============================================
   Component: Button
   ============================================ */

.btn {
  --btn-height: 2.5rem;
  --btn-padding-x: var(--space-4);
  --btn-font-size: var(--text-sm);
  --btn-radius: var(--radius-lg);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  block-size: var(--btn-height);
  padding-inline: var(--btn-padding-x);
  font-family: inherit;
  font-size: var(--btn-font-size);
  font-weight: 500;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  border: var(--border-width) solid transparent;
  border-radius: var(--btn-radius);
  transition:
    background-color var(--duration-fast) var(--easing-default),
    border-color var(--duration-fast) var(--easing-default),
    color var(--duration-fast) var(--easing-default),
    box-shadow var(--duration-fast) var(--easing-default),
    transform var(--duration-fast) var(--easing-default);
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:not(:disabled):active {
  transform: scale(0.98);
}

/* Button variants */
.btn--primary {
  background-color: var(--color-primary-600);
  color: white;
}

.btn--primary:not(:disabled):hover {
  background-color: var(--color-primary-700);
}

.btn--secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
  border-color: var(--border-color);
}

.btn--secondary:not(:disabled):hover {
  background-color: var(--color-gray-200);
}

.btn--ghost {
  background-color: transparent;
  color: var(--color-gray-700);
}

.btn--ghost:not(:disabled):hover {
  background-color: var(--color-gray-100);
}

/* Button sizes */
.btn--sm {
  --btn-height: 2rem;
  --btn-padding-x: var(--space-3);
  --btn-font-size: var(--text-xs);
}

.btn--lg {
  --btn-height: 3rem;
  --btn-padding-x: var(--space-6);
  --btn-font-size: var(--text-base);
}

/* ============================================
   Component: Card
   ============================================ */

.card {
  --card-padding: var(--space-6);
  --card-radius: var(--radius-xl);

  container-type: inline-size;
  background-color: white;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  .card {
    background-color: var(--color-gray-800);
  }
}

.card__header,
.card__body,
.card__footer {
  padding: var(--card-padding);
}

.card__header {
  border-block-end: var(--border-width) solid var(--border-color);
}

.card__footer {
  border-block-start: var(--border-width) solid var(--border-color);
}

/* Responsive card layout using container queries */
@container (min-width: 400px) {
  .card--horizontal {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .card--horizontal .card__media {
    grid-row: span 3;
    inline-size: 200px;
  }
}

/* ============================================
   Utilities
   ============================================ */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================
   Animations
   ============================================ */

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-fade-in {
  animation: fade-in var(--duration-normal) var(--easing-out);
}

.animate-slide-up {
  animation: slide-up var(--duration-slow) var(--easing-out);
}

.animate-spin {
  animation: spin 1s linear infinite;
}`,
  },

  shell: {
    label: 'Shell',
    lang: 'bash',
    code: `#!/usr/bin/env bash
#
# Production deployment script for containerized applications
# Supports blue-green deployment, rollback, and health checks
#
# Usage: ./deploy.sh [options] <environment>
#
# Options:
#   -t, --tag       Docker image tag to deploy (default: latest)
#   -r, --rollback  Rollback to previous deployment
#   -d, --dry-run   Show what would be done without making changes
#   -v, --verbose   Enable verbose output
#   -h, --help      Show this help message

set -euo pipefail
IFS=$'\\n\\t'

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "\${BASH_SOURCE[0]}")"
readonly LOG_FILE="/var/log/deploy/\${SCRIPT_NAME%.*}-$(date +%Y%m%d).log"

# Default values
IMAGE_TAG="latest"
DRY_RUN=false
VERBOSE=false
ROLLBACK=false
ENVIRONMENT=""

# Color codes for output
readonly RED='\\033[0;31m'
readonly GREEN='\\033[0;32m'
readonly YELLOW='\\033[0;33m'
readonly BLUE='\\033[0;34m'
readonly NC='\\033[0m' # No Color

# Application configuration (loaded from environment-specific config)
declare -A CONFIG=(
    [APP_NAME]="myapp"
    [DOCKER_REGISTRY]="registry.example.com"
    [HEALTH_CHECK_URL]="/health"
    [HEALTH_CHECK_TIMEOUT]=60
    [HEALTH_CHECK_INTERVAL]=5
    [CONTAINER_PORT]=8080
    [REPLICAS]=3
)

# ============================================
# Logging Functions
# ============================================

log() {
    local level="\$1"
    shift
    local message="\$*"
    local timestamp
    timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

    # Log to file
    echo "[\${timestamp}] [\${level}] \${message}" >> "\${LOG_FILE}"

    # Log to stdout with colors
    case "\${level}" in
        INFO)  echo -e "\${BLUE}[\${timestamp}]\${NC} \${message}" ;;
        OK)    echo -e "\${GREEN}[\${timestamp}]\${NC} \${message}" ;;
        WARN)  echo -e "\${YELLOW}[\${timestamp}]\${NC} \${message}" ;;
        ERROR) echo -e "\${RED}[\${timestamp}]\${NC} \${message}" >&2 ;;
    esac
}

info()  { log "INFO" "\$@"; }
ok()    { log "OK" "\$@"; }
warn()  { log "WARN" "\$@"; }
error() { log "ERROR" "\$@"; }

debug() {
    if [[ "\${VERBOSE}" == true ]]; then
        log "DEBUG" "\$@"
    fi
}

# ============================================
# Utility Functions
# ============================================

die() {
    error "\$1"
    exit "\${2:-1}"
}

usage() {
    cat << EOF
Usage: \${SCRIPT_NAME} [options] <environment>

Deploy application to the specified environment.

Options:
    -t, --tag <tag>     Docker image tag to deploy (default: latest)
    -r, --rollback      Rollback to previous deployment
    -d, --dry-run       Show what would be done without making changes
    -v, --verbose       Enable verbose output
    -h, --help          Show this help message

Environments:
    staging             Deploy to staging environment
    production          Deploy to production environment

Examples:
    \${SCRIPT_NAME} staging
    \${SCRIPT_NAME} -t v1.2.3 production
    \${SCRIPT_NAME} --rollback production
EOF
}

parse_args() {
    while [[ \$# -gt 0 ]]; do
        case "\$1" in
            -t|--tag)
                IMAGE_TAG="\$2"
                shift 2
                ;;
            -r|--rollback)
                ROLLBACK=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                die "Unknown option: \$1"
                ;;
            *)
                ENVIRONMENT="\$1"
                shift
                ;;
        esac
    done

    if [[ -z "\${ENVIRONMENT}" ]]; then
        usage
        die "Environment is required"
    fi

    if [[ ! "\${ENVIRONMENT}" =~ ^(staging|production)$ ]]; then
        die "Invalid environment: \${ENVIRONMENT}"
    fi
}

load_config() {
    local config_file="\${SCRIPT_DIR}/config/\${ENVIRONMENT}.env"

    if [[ ! -f "\${config_file}" ]]; then
        die "Configuration file not found: \${config_file}"
    fi

    info "Loading configuration from \${config_file}"

    # shellcheck source=/dev/null
    source "\${config_file}"
}

# ============================================
# Docker Functions
# ============================================

docker_login() {
    info "Logging in to Docker registry..."

    if [[ -z "\${DOCKER_PASSWORD:-}" ]]; then
        die "DOCKER_PASSWORD environment variable is not set"
    fi

    echo "\${DOCKER_PASSWORD}" | docker login \\
        --username "\${DOCKER_USERNAME:-deploy}" \\
        --password-stdin \\
        "\${CONFIG[DOCKER_REGISTRY]}" || die "Docker login failed"

    ok "Docker login successful"
}

pull_image() {
    local image="\${CONFIG[DOCKER_REGISTRY]}/\${CONFIG[APP_NAME]}:\${IMAGE_TAG}"

    info "Pulling image: \${image}"

    if [[ "\${DRY_RUN}" == true ]]; then
        debug "Would pull: \${image}"
        return 0
    fi

    docker pull "\${image}" || die "Failed to pull image: \${image}"
    ok "Image pulled successfully"
}

get_current_color() {
    # Returns 'blue' or 'green' based on current deployment
    local current
    current="$(docker ps --filter "name=\${CONFIG[APP_NAME]}" --format '{{.Names}}' | head -1)"

    if [[ "\${current}" == *"-blue"* ]]; then
        echo "blue"
    else
        echo "green"
    fi
}

# ============================================
# Health Check Functions
# ============================================

wait_for_healthy() {
    local container="\$1"
    local timeout="\${CONFIG[HEALTH_CHECK_TIMEOUT]}"
    local interval="\${CONFIG[HEALTH_CHECK_INTERVAL]}"
    local elapsed=0

    info "Waiting for container to be healthy (timeout: \${timeout}s)..."

    while [[ \${elapsed} -lt \${timeout} ]]; do
        local status
        status="$(docker inspect --format='{{.State.Health.Status}}' "\${container}" 2>/dev/null || echo "unknown")"

        case "\${status}" in
            healthy)
                ok "Container is healthy"
                return 0
                ;;
            unhealthy)
                die "Container is unhealthy"
                ;;
            *)
                debug "Health status: \${status}, waiting..."
                sleep "\${interval}"
                elapsed=$((elapsed + interval))
                ;;
        esac
    done

    die "Health check timeout after \${timeout}s"
}

# ============================================
# Deployment Functions
# ============================================

deploy() {
    local image="\${CONFIG[DOCKER_REGISTRY]}/\${CONFIG[APP_NAME]}:\${IMAGE_TAG}"
    local current_color new_color
    current_color="$(get_current_color)"

    if [[ "\${current_color}" == "blue" ]]; then
        new_color="green"
    else
        new_color="blue"
    fi

    info "Deploying \${new_color} (\${image})..."

    if [[ "\${DRY_RUN}" == true ]]; then
        info "[DRY RUN] Would deploy \${new_color} environment"
        return 0
    fi

    # Start new containers
    local container_name="\${CONFIG[APP_NAME]}-\${new_color}"

    docker run -d \\
        --name "\${container_name}" \\
        --restart unless-stopped \\
        --network app-network \\
        -p "\${CONFIG[CONTAINER_PORT]}" \\
        -e "ENVIRONMENT=\${ENVIRONMENT}" \\
        -e "APP_VERSION=\${IMAGE_TAG}" \\
        "\${image}" || die "Failed to start container"

    # Wait for health check
    wait_for_healthy "\${container_name}"

    # Switch traffic
    info "Switching traffic to \${new_color}..."
    update_load_balancer "\${new_color}"

    # Stop old containers
    info "Stopping old containers..."
    docker stop "\${CONFIG[APP_NAME]}-\${current_color}" 2>/dev/null || true
    docker rm "\${CONFIG[APP_NAME]}-\${current_color}" 2>/dev/null || true

    ok "Deployment completed successfully!"
}

rollback() {
    info "Rolling back to previous deployment..."

    if [[ "\${DRY_RUN}" == true ]]; then
        info "[DRY RUN] Would rollback deployment"
        return 0
    fi

    # Get previous image tag from deployment history
    local previous_tag
    previous_tag="$(cat "\${SCRIPT_DIR}/deployments/\${ENVIRONMENT}.history" | tail -2 | head -1)"

    if [[ -z "\${previous_tag}" ]]; then
        die "No previous deployment found"
    fi

    IMAGE_TAG="\${previous_tag}"
    deploy

    ok "Rollback completed successfully!"
}

update_load_balancer() {
    local target="\$1"
    debug "Updating load balancer to point to \${target}"
    # Implementation depends on your load balancer (nginx, HAProxy, etc.)
}

# ============================================
# Main
# ============================================

main() {
    # Ensure log directory exists
    mkdir -p "$(dirname "\${LOG_FILE}")"

    info "Starting deployment script"
    debug "Script directory: \${SCRIPT_DIR}"

    parse_args "\$@"

    info "Environment: \${ENVIRONMENT}"
    info "Image tag: \${IMAGE_TAG}"
    info "Dry run: \${DRY_RUN}"
    info "Rollback: \${ROLLBACK}"

    load_config
    docker_login
    pull_image

    if [[ "\${ROLLBACK}" == true ]]; then
        rollback
    else
        deploy
    fi

    info "Script completed successfully"
}

# Run main function if script is executed directly
if [[ "\${BASH_SOURCE[0]}" == "\${0}" ]]; then
    main "\$@"
fi`,
  },

  json: {
    label: 'JSON',
    lang: 'json',
    code: `{
  "$schema": "https://json.schemastore.org/package.json",
  "name": "@taskflow/core",
  "version": "2.4.0",
  "description": "Core library for the TaskFlow task management platform",
  "keywords": [
    "task-management",
    "productivity",
    "project-management",
    "collaboration",
    "typescript"
  ],
  "homepage": "https://github.com/taskflow/core#readme",
  "bugs": {
    "url": "https://github.com/taskflow/core/issues",
    "email": "support@taskflow.io"
  },
  "license": "MIT",
  "author": {
    "name": "TaskFlow Team",
    "email": "team@taskflow.io",
    "url": "https://taskflow.io"
  },
  "contributors": [
    {
      "name": "Alice Johnson",
      "email": "alice@taskflow.io"
    },
    {
      "name": "Bob Smith",
      "email": "bob@taskflow.io"
    }
  ],
  "funding": {
    "type": "github",
    "url": "https://github.com/sponsors/taskflow"
  },
  "files": [
    "dist",
    "src",
    "!**/*.test.*",
    "!**/*.spec.*"
  ],
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "default": "./dist/esm/index.js"
    },
    "./utils": {
      "types": "./dist/types/utils/index.d.ts",
      "import": "./dist/esm/utils/index.js",
      "require": "./dist/cjs/utils/index.js"
    },
    "./hooks": {
      "types": "./dist/types/hooks/index.d.ts",
      "import": "./dist/esm/hooks/index.js",
      "require": "./dist/cjs/hooks/index.js"
    },
    "./package.json": "./package.json"
  },
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "build": "npm run clean && npm run build:esm && npm run build:cjs && npm run build:types",
    "build:esm": "tsc --project tsconfig.esm.json",
    "build:cjs": "tsc --project tsconfig.cjs.json",
    "build:types": "tsc --project tsconfig.types.json",
    "clean": "rimraf dist coverage",
    "dev": "vitest watch",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "prepare": "husky install",
    "prepublishOnly": "npm run build",
    "release": "semantic-release",
    "start": "npm run dev",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "date-fns": "^3.0.0",
    "immer": "^10.0.0",
    "nanoid": "^5.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.4.0",
    "@commitlint/config-conventional": "^18.4.0",
    "@semantic-release/changelog": "^6.0.0",
    "@semantic-release/git": "^10.0.0",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "eslint": "^8.55.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.0",
    "rimraf": "^5.0.0",
    "semantic-release": "^22.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-dom": {
      "optional": true
    }
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@10.2.0",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/taskflow/core.git",
    "directory": "packages/core"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  },
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ]
  },
  "release": {
    "branches": [
      "main",
      {
        "name": "next",
        "prerelease": true
      }
    ],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      [
        "@semantic-release/git",
        {
          "assets": [
            "CHANGELOG.md",
            "package.json"
          ]
        }
      ]
    ]
  }
}`,
  },
}

export const LANGUAGE_ORDER = [
  'typescript',
  'python',
  'rust',
  'go',
  'html',
  'css',
  'shell',
  'json',
] as const

export type LanguageKey = (typeof LANGUAGE_ORDER)[number]
