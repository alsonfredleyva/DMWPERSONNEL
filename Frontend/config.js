(function () {
    const globalScope = window;
    const fromGlobal = globalScope.__DMW_API_BASE_URL__ || globalScope.__API_BASE_URL__ || globalScope.API_BASE_URL;
    const normalizeBaseUrl = (value) => {
        if (!value) return '';
        return String(value).replace(/\/$/, '');
    };

    const fallbackBaseUrl = globalScope.location && (globalScope.location.hostname === 'localhost' || globalScope.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : '/api';

    const apiBaseUrl = normalizeBaseUrl(fromGlobal) || fallbackBaseUrl;

    globalScope.DMW_CONFIG = globalScope.DMW_CONFIG || {};
    globalScope.DMW_CONFIG.apiBaseUrl = apiBaseUrl;
})();
<script>
  window.__DMW_API_BASE_URL__ = 'https://dmwpersonnel.onrender.com/api';
</script>
