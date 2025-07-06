# AutoVault Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Infrastructure Setup](#infrastructure-setup)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Security Configuration](#security-configuration)
9. [Testing Deployment](#testing-deployment)
10. [Maintenance and Updates](#maintenance-and-updates)

## Overview

This guide covers the complete deployment process for AutoVault on the Massa Network, including smart contracts, frontend application, and supporting infrastructure.

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │  Massa Network  │
│   (React/Vue)   │◄──►│   (Node.js)     │◄──►│  Smart Contracts│
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Authentication│    │ • Vault         │
│ • Portfolio     │    │ • Rate Limiting │    │ • Strategy      │
│ • Governance    │    │ • Caching       │    │ • Governance    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      CDN        │    │    Database     │    │    Oracles      │
│   (Cloudflare)  │    │  (PostgreSQL)   │    │  (Massa Oracles)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ or macOS 10.15+
- **Node.js**: Version 18.0+
- **Rust**: Latest stable version
- **Docker**: Version 20.10+
- **Git**: Version 2.30+

### Development Tools
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Massa CLI tools
cargo install massa-cli
```

### Network Access
- **Massa Mainnet**: Access to Massa Network nodes
- **Domain Name**: Configured DNS for your domain
- **SSL Certificates**: Valid SSL certificates for HTTPS
- **Cloud Provider**: AWS, GCP, or Azure account

## Environment Setup

### Environment Variables
Create environment configuration files for different deployment stages.

#### Production Environment (.env.production)
```bash
# Network Configuration
MASSA_NETWORK=mainnet
MASSA_RPC_URL=https://mainnet.massa.net/api/v2
MASSA_CHAIN_ID=77658366

# Contract Addresses
VAULT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
STRATEGY_CONTRACT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
GOVERNANCE_CONTRACT_ADDRESS=0x567890abcdef1234567890abcdef1234567890ab
ORACLE_CONTRACT_ADDRESS=0xcdef1234567890abcdef1234567890abcdef1234

# API Configuration
API_BASE_URL=https://api.autovault.massa.net
WEBSOCKET_URL=wss://api.autovault.massa.net/ws
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/autovault
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-encryption-key-32-chars
CORS_ORIGIN=https://autovault.massa.net

# External Services
CLOUDFLARE_API_TOKEN=your-cloudflare-token
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id

# Feature Flags
ENABLE_GOVERNANCE=true
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

#### Staging Environment (.env.staging)
```bash
# Network Configuration
MASSA_NETWORK=testnet
MASSA_RPC_URL=https://testnet.massa.net/api/v2
MASSA_CHAIN_ID=77658367

# Contract Addresses (Testnet)
VAULT_CONTRACT_ADDRESS=0xtest1234567890abcdef1234567890abcdef12345
STRATEGY_CONTRACT_ADDRESS=0xtestabcdef1234567890abcdef1234567890abcd
GOVERNANCE_CONTRACT_ADDRESS=0xtest567890abcdef1234567890abcdef12345678
ORACLE_CONTRACT_ADDRESS=0xtestcdef1234567890abcdef1234567890abcdef

# API Configuration
API_BASE_URL=https://api-staging.autovault.massa.net
WEBSOCKET_URL=wss://api-staging.autovault.massa.net/ws

# Database Configuration
DATABASE_URL=postgresql://user:password@staging-db:5432/autovault_staging
REDIS_URL=redis://staging-redis:6379

# Security (Use different keys for staging)
JWT_SECRET=staging-jwt-secret
ENCRYPTION_KEY=staging-encryption-key-32-chars
CORS_ORIGIN=https://staging.autovault.massa.net
```

### Configuration Management
```javascript
// config/index.js
const config = {
  development: {
    massa: {
      network: 'testnet',
      rpcUrl: process.env.MASSA_RPC_URL,
      chainId: parseInt(process.env.MASSA_CHAIN_ID)
    },
    contracts: {
      vault: process.env.VAULT_CONTRACT_ADDRESS,
      strategy: process.env.STRATEGY_CONTRACT_ADDRESS,
      governance: process.env.GOVERNANCE_CONTRACT_ADDRESS,
      oracle: process.env.ORACLE_CONTRACT_ADDRESS
    },
    api: {
      baseUrl: process.env.API_BASE_URL,
      version: process.env.API_VERSION,
      timeout: 30000
    },
    database: {
      url: process.env.DATABASE_URL,
      pool: {
        min: 2,
        max: 10
      }
    }
  },
  production: {
    // Production configuration
    massa: {
      network: 'mainnet',
      rpcUrl: process.env.MASSA_RPC_URL,
      chainId: parseInt(process.env.MASSA_CHAIN_ID)
    },
    // ... other production settings
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

## Smart Contract Deployment

### Contract Compilation
```bash
# Navigate to contracts directory
cd contracts

# Compile contracts
cargo build --release

# Run tests
cargo test

# Generate ABI files
cargo run --bin generate-abi
```

### Deployment Scripts
Create deployment scripts for automated contract deployment.

#### deploy.js
```javascript
const { MassaClient } = require('@massalabs/massa-web3');
const fs = require('fs');

class ContractDeployer {
  constructor(config) {
    this.client = new MassaClient({
      rpcUrl: config.massa.rpcUrl,
      chainId: config.massa.chainId
    });
    this.config = config;
  }

  async deployVaultContract() {
    console.log('Deploying Vault Contract...');
    
    const bytecode = fs.readFileSync('./target/wasm32-unknown-unknown/release/vault.wasm');
    const abi = JSON.parse(fs.readFileSync('./abi/vault.json'));
    
    const deployment = await this.client.smartContracts().deploy({
      bytecode,
      constructorArgs: [
        this.config.governance.initialAdmin,
        this.config.vault.feePercentage,
        this.config.vault.maxStrategies
      ],
      gasLimit: 5000000
    });
    
    console.log(`Vault Contract deployed at: ${deployment.address}`);
    return deployment.address;
  }

  async deployStrategyContract(vaultAddress) {
    console.log('Deploying Strategy Contract...');
    
    const bytecode = fs.readFileSync('./target/wasm32-unknown-unknown/release/strategy.wasm');
    
    const deployment = await this.client.smartContracts().deploy({
      bytecode,
      constructorArgs: [vaultAddress],
      gasLimit: 3000000
    });
    
    console.log(`Strategy Contract deployed at: ${deployment.address}`);
    return deployment.address;
  }

  async deployGovernanceContract(vaultAddress) {
    console.log('Deploying Governance Contract...');
    
    const bytecode = fs.readFileSync('./target/wasm32-unknown-unknown/release/governance.wasm');
    
    const deployment = await this.client.smartContracts().deploy({
      bytecode,
      constructorArgs: [
        vaultAddress,
        this.config.governance.votingPeriod,
        this.config.governance.quorumPercentage
      ],
      gasLimit: 4000000
    });
    
    console.log(`Governance Contract deployed at: ${deployment.address}`);
    return deployment.address;
  }

  async deployAll() {
    try {
      // Deploy contracts in order
      const vaultAddress = await this.deployVaultContract();
      const strategyAddress = await this.deployStrategyContract(vaultAddress);
      const governanceAddress = await this.deployGovernanceContract(vaultAddress);
      
      // Update vault with strategy and governance addresses
      await this.updateVaultConfiguration(vaultAddress, strategyAddress, governanceAddress);
      
      // Save deployment addresses
      const deploymentInfo = {
        vault: vaultAddress,
        strategy: strategyAddress,
        governance: governanceAddress,
        network: this.config.massa.network,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
      console.log('Deployment completed successfully!');
      
      return deploymentInfo;
    } catch (error) {
      console.error('Deployment failed:', error);
      throw error;
    }
  }
}

// Deployment execution
async function main() {
  const config = require('../config');
  const deployer = new ContractDeployer(config);
  
  await deployer.deployAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ContractDeployer;
```

### Contract Verification
```bash
# Verify contracts on Massa Explorer
massa-cli verify-contract \
  --address $VAULT_CONTRACT_ADDRESS \
  --source-code ./contracts/vault.rs \
  --compiler-version 1.70.0

massa-cli verify-contract \
  --address $STRATEGY_CONTRACT_ADDRESS \
  --source-code ./contracts/strategy.rs \
  --compiler-version 1.70.0
```

## Frontend Deployment

### Build Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        governance: resolve(__dirname, 'governance.html')
      }
    }
  },
  define: {
    'process.env.MASSA_NETWORK': JSON.stringify(process.env.MASSA_NETWORK),
    'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL),
    'process.env.VAULT_CONTRACT_ADDRESS': JSON.stringify(process.env.VAULT_CONTRACT_ADDRESS)
  },
  server: {
    port: 3000,
    host: true
  }
});
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates
COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    server {
        listen 80;
        server_name autovault.massa.net;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name autovault.massa.net;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # API proxy
        location /api/ {
            proxy_pass http://api-backend:3001/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # WebSocket proxy
        location /ws {
            proxy_pass http://api-backend:3001/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
        
        # Frontend routes
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api-backend
    restart: unless-stopped

  api-backend:
    build:
      context: ./api
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - MASSA_RPC_URL=${MASSA_RPC_URL}
    depends_on:
      - database
      - redis
    restart: unless-stopped

  database:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=autovault
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
```

## Infrastructure Setup

### AWS Deployment
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure

# Create ECS cluster
aws ecs create-cluster --cluster-name autovault-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster autovault-cluster \
  --service-name autovault-service \
  --task-definition autovault:1 \
  --desired-count 2
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: autovault-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: autovault-frontend
  template:
    metadata:
      labels:
        app: autovault-frontend
    spec:
      containers:
      - name: frontend
        image: autovault/frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: autovault-config
              key: api-base-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: autovault-frontend-service
spec:
  selector:
    app: autovault-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### CDN Configuration
```javascript
// cloudflare-config.js
const cloudflare = require('cloudflare');

const cf = cloudflare({
  token: process.env.CLOUDFLARE_API_TOKEN
});

async function configureCDN() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  
  // Enable caching rules
  await cf.zones.settings.edit(zoneId, 'cache_level', { value: 'aggressive' });
  
  // Set up page rules
  await cf.zones.pagerules.create(zoneId, {
    targets: [{ target: 'url', constraint: { operator: 'matches', value: '*.autovault.massa.net/static/*' }}],
    actions: [
      { id: 'cache_level', value: 'cache_everything' },
      { id: 'edge_cache_ttl', value: 31536000 }
    ]
  });
  
  // Configure security settings
  await cf.zones.settings.edit(zoneId, 'security_level', { value: 'medium' });
  await cf.zones.settings.edit(zoneId, 'ssl', { value: 'strict' });
}

configureCDN().catch(console.error);
```

## Monitoring and Logging

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'autovault-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    
  - job_name: 'autovault-api'
    static_configs:
      - targets: ['api-backend:3001']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['database:5432']
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "AutoVault Monitoring",
    "panels": [
      {
        "title": "Total Value Locked",
        "type": "stat",
        "targets": [
          {
            "expr": "autovault_tvl_total",
            "legendFormat": "TVL"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "graph",
        "targets": [
          {
            "expr": "autovault_active_users",
            "legendFormat": "Users"
          }
        ]
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds",
            "legendFormat": "Response Time"
          }
        ]
      }
    ]
  }
}
```

### Logging Configuration
```javascript
// logger.js
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'autovault-logs'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificates with Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d autovault.massa.net -d api.autovault.massa.net

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers
```javascript
// security-middleware.js
const helmet = require('helmet');

module.exports = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.autovault.massa.net", "wss://api.autovault.massa.net"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});
```

### Rate Limiting
```javascript
// rate-limiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = limiter;
```

## Testing Deployment

### Health Checks
```javascript
// health-check.js
const axios = require('axios');

class HealthChecker {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async checkFrontend() {
    try {
      const response = await axios.get(`${this.baseUrl}/`);
      return response.status === 200;
    } catch (error) {
      console.error('Frontend health check failed:', error.message);
      return false;
    }
  }

  async checkAPI() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`);
      return response.status === 200 && response.data.status === 'ok';
    } catch (error) {
      console.error('API health check failed:', error.message);
      return false;
    }
  }

  async checkDatabase() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/health/database`);
      return response.status === 200 && response.data.database === 'connected';
    } catch (error) {
      console.error('Database health check failed:', error.message);
      return false;
    }
  }

  async runAllChecks() {
    const results = {
      frontend: await this.checkFrontend(),
      api: await this.checkAPI(),
      database: await this.checkDatabase()
    };

    const allHealthy = Object.values(results).every(result => result === true);
    
    console.log('Health Check Results:', results);
    console.log('Overall Status:', allHealthy ? 'HEALTHY' : 'UNHEALTHY');
    
    return { results, healthy: allHealthy };
  }
}

// Run health checks
const checker = new HealthChecker('https://autovault.massa.net');
checker.runAllChecks();
```

### Load Testing
```javascript
// load-test.js
const autocannon = require('autocannon');

async function runLoadTest() {
  const result = await autocannon({
    url: 'https://autovault.massa.net',
    connections: 100,
    duration: 60,
    requests: [
      {
        method: 'GET',
        path: '/'
      },
      {
        method: 'GET',
        path: '/api/portfolio/0x1234567890abcdef1234567890abcdef12345678'
      },
      {
        method: 'GET',
        path: '/api/strategies'
      }
    ]
  });

  console.log('Load Test Results:');
  console.log(`Requests per second: ${result.requests.average}`);
  console.log(`Latency average: ${result.latency.average}ms`);
  console.log(`Throughput: ${result.throughput.average} bytes/sec`);
}

runLoadTest().catch(console.error);
```

## Maintenance and Updates

### Deployment Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy AutoVault

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker build -t autovault/frontend:${{ github.sha }} .
          docker push autovault/frontend:${{ github.sha }}
          kubectl set image deployment/autovault-frontend frontend=autovault/frontend:${{ github.sha }}
```

### Backup Strategy
```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://autovault-backups/database/

# Contract state backup
massa-cli export-state --contract $VAULT_CONTRACT_ADDRESS > vault_state_$(date +%Y%m%d_%H%M%S).json

# Upload contract state
aws s3 cp vault_state_*.json s3://autovault-backups/contracts/

# Clean old backups (keep last 30 days)
find . -name "backup_*.sql" -mtime +30 -delete
find . -name "vault_state_*.json" -mtime +30 -delete
```

### Update Procedures
```bash
#!/bin/bash
# update.sh

echo "Starting AutoVault update..."

# 1. Backup current state
./backup.sh

# 2. Update smart contracts (if needed)
if [ "$UPDATE_CONTRACTS" = "true" ]; then
  echo "Updating smart contracts..."
  cd contracts
  cargo build --release
  # Deploy new contracts with migration
  node deploy-migration.js
  cd ..
fi

# 3. Update frontend
echo "Updating frontend..."
docker pull autovault/frontend:latest
docker-compose up -d frontend

# 4. Update API
echo "Updating API..."
docker pull autovault/api:latest
docker-compose up -d api-backend

# 5. Run health checks
echo "Running health checks..."
node health-check.js

echo "Update completed successfully!"
```

This comprehensive deployment guide covers all aspects of deploying AutoVault to production, from smart contracts to frontend applications, including security, monitoring, and maintenance procedures.