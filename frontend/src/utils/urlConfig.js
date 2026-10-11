import rawUrl from "../url.json";

const ensureTrailingSlash = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
};

const getBrowserLocation = () => {
  if (typeof window === "undefined" || !window.location) return null;
  return window.location;
};

const getRuntimeOrigin = () => {
  const location = getBrowserLocation();
  if (!location?.origin) return "";
  return ensureTrailingSlash(location.origin);
};

const isLocalDevelopmentHost = () => {
  const location = getBrowserLocation();
  return location?.hostname === "localhost" || location?.hostname === "127.0.0.1";
};

const getRuntimeBackendHost = () => {
  const location = getBrowserLocation();
  if (!location?.origin) return "";

  const apiPrefixHosts = new Set(["icit.lazyinwork.com"]);
  const base = location.protocol === "https:" && apiPrefixHosts.has(location.hostname)
    ? `${location.origin}/api`
    : location.origin;

  return ensureTrailingSlash(base);
};

const runtimeOrigin = getRuntimeOrigin();
const useConfiguredLocalHosts = isLocalDevelopmentHost();
const runtimeBackendHost = useConfiguredLocalHosts
  ? ensureTrailingSlash(rawUrl.backendHost)
  : getRuntimeBackendHost() || ensureTrailingSlash(rawUrl.backendHost);
const runtimeSocketHost = useConfiguredLocalHosts
  ? ensureTrailingSlash(rawUrl.socketioHost)
  : runtimeOrigin || ensureTrailingSlash(rawUrl.socketioHost);

const url = {
  ...rawUrl,
  backendHost: runtimeBackendHost,
  backupBackendHost: useConfiguredLocalHosts
    ? ensureTrailingSlash(rawUrl.backupBackendHost)
    : runtimeBackendHost,
  localBackendHost: useConfiguredLocalHosts
    ? ensureTrailingSlash(rawUrl.localBackendHost)
    : runtimeBackendHost,
  socketioHost: runtimeSocketHost,
};

export default url;
