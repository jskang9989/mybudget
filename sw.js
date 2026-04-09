const CACHE_NAME = 'budget-app-v2';

// 캐시할 로컬 파일만 지정
const ASSETS = [
  './index.html',
  './manifest.json'
];

// 네트워크에서만 가져와야 하는 도메인 목록
const NETWORK_ONLY = [
  'firebase',
  'firestore',
  'googleapis.com',
  'gstatic.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Firebase / Google API / 외부 리소스는 반드시 네트워크에서만
  if (NETWORK_ONLY.some(domain => url.includes(domain))) {
    e.respondWith(fetch(e.request));
    return;
  }

  // chrome-extension 등 처리 불가 요청 무시
  if (!url.startsWith('http')) return;

  // 로컬 파일만 캐시 우선
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
