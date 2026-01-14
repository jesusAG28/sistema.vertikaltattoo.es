Poseidon template should help get you started developing with Vue and PrimeVue in Vite.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Enable custom domain Reverse Proxy (https://transport-app.test)

Enables local development environment (compile + hot-reload) access under custom domain.

#### Known limitations

Hard coded to port 5173 (http://localhost:5173)

#### Required enabled apache modules (Apache httpd.conf file)

- `mod_proxy.so`: `LoadModule proxy_module modules/mod_proxy.so`
- `mod_proxy_http.so`: enable / uncomment `LoadModule proxy_http_module modules/mod_proxy_http.so`

#### Virtual host additional configuration (Reverse proxy config)

Additional configuration snippet:

```
ProxyRequests Off
ProxyPreserveHost On

RewriteEngine On
RewriteCond %{HTTP:Connection} Upgrade [NC]
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteRule /(.*) ws://localhost:5173/$1  [P,L]

ProxyPass / http://localhost:5173/
ProxyPassReverse / http://localhost:5173/
```

Full example virtual host configuration file (auto.transport-app.test.conf):

```
define ROOT "C:/laragon/www/transport-app"
define SITE "transport-app.test"

<VirtualHost *:80>
    DocumentRoot "${ROOT}"
    ServerName ${SITE}
    ServerAlias *.${SITE}
    <Directory "${ROOT}">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:443>
    DocumentRoot "${ROOT}"
    ServerName ${SITE}
    ServerAlias *.${SITE}
    <Directory "${ROOT}">
        AllowOverride All
        Require all granted
    </Directory>

	ProxyRequests Off
    ProxyPreserveHost On

	RewriteEngine On
    RewriteCond %{HTTP:Connection} Upgrade [NC]
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule /(.*) ws://localhost:5173/$1  [P,L]

	ProxyPass / http://localhost:5173/
    ProxyPassReverse / http://localhost:5173/

    SSLEngine on
    SSLCertificateFile      C:/laragon/etc/ssl/laragon.crt
    SSLCertificateKeyFile   C:/laragon/etc/ssl/laragon.key

</VirtualHost>
```
