// Garde toute l'appli Tablée sur le téléphone pour qu'elle marche sans connexion.
// Changer VERSION à chaque mise à jour pour que les téléphones récupèrent la nouvelle version.
const VERSION = "tablee-v22";
const FILES = ["./", "index.html", "manifest.webmanifest", "Fredoka.ttf",
  "cover/", "spy/", "milieu/", "codes/", "preferes/", "artiste/", "piege/", "regle/", "mdp/", "motcache/", "time/", "tete/", "loup/", "apero/",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-64.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// réseau d'abord (pour avoir la dernière version), le cache si pas de connexion
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const same = new URL(e.request.url).origin === location.origin;
  // no-cache : on revérifie toujours auprès de GitHub (sinon le navigateur garde l'ancienne page 10 min)
  const net = same ? fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }) : fetch(e.request);
  e.respondWith(
    net.then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
