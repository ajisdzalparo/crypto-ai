# Deploy Alpha Screener ke VPS

## Prerequisites

- VPS (Ubuntu 22.04+ recommended)
- Domain: `ajisdzalparo.com` dengan akses DNS
- Docker & Docker Compose installed di VPS

---

## Step 1: Setup DNS Subdomain

Di DNS provider (Cloudflare/Namecheap/etc), tambahkan A record:

```
Type: A
Name: crypto (untuk crypto.ajisdzalparo.com)
Value: [IP_VPS_KAMU]
TTL: Auto
```

---

## Step 2: SSH ke VPS & Clone Repository

```bash
ssh root@[IP_VPS]

# Install Docker (jika belum)
curl -fsSL https://get.docker.com | sh

# Clone project
cd /opt
git clone https://github.com/ajisdzalparo/crypto-ai.git
cd crypto-ai
```

---

## Step 3: Setup Environment Variables

```bash
cp .env.example .env
nano .env
```

Isi dengan:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=alpha_screener

# App
DATABASE_URL=postgresql://postgres:your_secure_password_here@db:5432/alpha_screener
OPEN_ROUTER=your_openrouter_api_key
```

---

## Step 4: Update docker-compose.yml untuk Production

Tambahkan Caddy sebagai reverse proxy dengan auto SSL:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: crypto-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  app:
    build: .
    container_name: crypto-app
    restart: unless-stopped
    environment:
      DATABASE_URL: ${DATABASE_URL}
      OPEN_ROUTER: ${OPEN_ROUTER}
    depends_on:
      - db
    networks:
      - app-network
    command: sh -c "bunx prisma db push && bun server.js"

  caddy:
    image: caddy:2-alpine
    container_name: crypto-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - app-network
    depends_on:
      - app

volumes:
  postgres_data:
  caddy_data:
  caddy_config:

networks:
  app-network:
    driver: bridge
```

---

## Step 5: Buat Caddyfile untuk Auto SSL

```bash
nano Caddyfile
```

Isi dengan:

```
crypto.ajisdzalparo.com {
    reverse_proxy app:3000
}
```

---

## Step 6: Deploy!

```bash
# Build & jalankan
docker compose up -d --build

# Cek logs
docker compose logs -f

# Cek status
docker compose ps
```

---

## Step 7: Verify

Buka browser:

```
https://crypto.ajisdzalparo.com
```

---

## Useful Commands

```bash
# Restart services
docker compose restart

# Stop all
docker compose down

# Update & redeploy
git pull
docker compose up -d --build

# View logs
docker compose logs -f app
docker compose logs -f db

# Database shell
docker compose exec db psql -U postgres -d alpha_screener
```

---

## Troubleshooting

### Port 80/443 sudah digunakan

```bash
# Cek proses
sudo lsof -i :80
sudo lsof -i :443

# Stop nginx/apache jika ada
sudo systemctl stop nginx
sudo systemctl stop apache2
```

### SSL tidak bekerja

- Pastikan DNS sudah propagate (cek di https://dnschecker.org)
- Pastikan port 80 & 443 open di firewall VPS

### Database error

```bash
# Reset database
docker compose down -v
docker compose up -d --build
```
