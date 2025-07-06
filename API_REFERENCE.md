# AutoVault API Reference

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Portfolio API](#portfolio-api)
4. [Strategy API](#strategy-api)
5. [Governance API](#governance-api)
6. [Analytics API](#analytics-api)
7. [WebSocket Events](#websocket-events)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [SDK Examples](#sdk-examples)

## Overview

The AutoVault API provides programmatic access to portfolio management, strategy optimization, governance participation, and analytics data. All endpoints return JSON responses and follow RESTful conventions.

### Base URL
```
Production: https://api.autovault.massa.net/v1
Testnet: https://api-testnet.autovault.massa.net/v1
Local: http://localhost:3001/api/v1
```

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2025-01-27T10:30:00Z",
  "version": "1.0.0"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Deposit amount must be greater than 0",
    "details": { /* additional error context */ }
  },
  "timestamp": "2025-01-27T10:30:00Z"
}
```

## Authentication

### Wallet Signature Authentication
All API requests require wallet signature authentication for security.

#### Headers
```http
Authorization: Bearer <jwt_token>
X-Wallet-Address: <wallet_address>
X-Signature: <message_signature>
X-Timestamp: <unix_timestamp>
```

#### Authentication Flow
1. **Generate Message**: Create timestamp-based message
2. **Sign Message**: Sign with wallet private key
3. **Include Headers**: Add authentication headers to request

#### Example Authentication
```javascript
const message = `AutoVault API Access: ${timestamp}`;
const signature = await wallet.signMessage(message);

const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'X-Wallet-Address': walletAddress,
  'X-Signature': signature,
  'X-Timestamp': timestamp.toString()
};
```

## Portfolio API

### Get Portfolio Overview
Retrieve complete portfolio information for a user.

```http
GET /portfolio/{address}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| address | string | Yes | Wallet address |

#### Response
```json
{
  "success": true,
  "data": {
    "totalValue": 12456.78,
    "totalDeposited": 10000.00,
    "totalEarned": 2456.78,
    "performance24h": {
      "absolute": 123.45,
      "percentage": 1.02
    },
    "riskProfile": "balanced",
    "allocations": [
      {
        "strategyId": "massa-usdc-lp",
        "strategyName": "MASSA-USDC LP",
        "allocatedAmount": 5000.00,
        "currentValue": 5234.56,
        "apy": 24.5,
        "riskScore": 6
      }
    ],
    "rewards": {
      "vault": {
        "earned": 156.78,
        "claimed": 100.00,
        "pending": 56.78
      }
    }
  }
}
```

### Deposit Assets
Initiate a deposit transaction.

```http
POST /portfolio/deposit
```

#### Request Body
```json
{
  "amount": 1000.00,
  "asset": "MASSA",
  "riskProfile": "balanced"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "transactionId": "0x1234567890abcdef",
    "estimatedGas": 150000,
    "estimatedAllocation": {
      "liquidityPools": 50.0,
      "lending": 30.0,
      "staking": 20.0
    }
  }
}
```

### Withdraw Assets
Process asset withdrawal.

```http
POST /portfolio/withdraw
```

#### Request Body
```json
{
  "amount": 500.00,
  "asset": "MASSA",
  "strategyId": "massa-staking" // Optional: specific strategy
}
```

### Get Portfolio History
Retrieve historical portfolio performance.

```http
GET /portfolio/{address}/history
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 30d | Time period (1d, 7d, 30d, 90d, 1y) |
| interval | string | 1h | Data interval (1m, 5m, 1h, 1d) |

#### Response
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "interval": "1h",
    "dataPoints": [
      {
        "timestamp": "2025-01-01T00:00:00Z",
        "totalValue": 10000.00,
        "performance": 0.00
      },
      {
        "timestamp": "2025-01-01T01:00:00Z",
        "totalValue": 10012.34,
        "performance": 0.12
      }
    ]
  }
}
```

## Strategy API

### Get Available Strategies
List all available investment strategies.

```http
GET /strategies
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| riskProfile | string | all | Filter by risk profile |
| minApy | number | 0 | Minimum APY filter |
| category | string | all | Strategy category filter |

#### Response
```json
{
  "success": true,
  "data": {
    "strategies": [
      {
        "id": "massa-usdc-lp",
        "name": "MASSA-USDC Liquidity Pool",
        "protocol": "MassaDEX",
        "category": "liquidity_provision",
        "currentApy": 24.5,
        "riskScore": 6,
        "tvl": 1200000,
        "description": "Provide liquidity to MASSA-USDC trading pair",
        "requirements": {
          "minDeposit": 100,
          "supportedAssets": ["MASSA", "USDC"]
        },
        "metrics": {
          "volume24h": 150000,
          "fees24h": 1250,
          "impermanentLoss": 2.3
        }
      }
    ]
  }
}
```

### Get Strategy Details
Retrieve detailed information about a specific strategy.

```http
GET /strategies/{strategyId}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "massa-usdc-lp",
    "name": "MASSA-USDC Liquidity Pool",
    "protocol": "MassaDEX",
    "description": "Detailed strategy description...",
    "performance": {
      "apy": {
        "current": 24.5,
        "average30d": 22.8,
        "min30d": 18.2,
        "max30d": 28.1
      },
      "returns": {
        "1d": 0.067,
        "7d": 0.45,
        "30d": 1.89
      }
    },
    "risks": {
      "impermanentLoss": {
        "current": 2.3,
        "max30d": 5.7
      },
      "smartContract": "audited",
      "liquidity": "high"
    },
    "allocation": {
      "totalAllocated": 5000000,
      "userCount": 234,
      "maxCapacity": 10000000
    }
  }
}
```

### Get Strategy Performance
Historical performance data for a strategy.

```http
GET /strategies/{strategyId}/performance
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 30d | Time period |
| metric | string | apy | Performance metric (apy, tvl, volume) |

## Governance API

### Get Proposals
List governance proposals.

```http
GET /governance/proposals
```

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | all | Proposal status (active, pending, executed) |
| limit | number | 20 | Number of proposals to return |
| offset | number | 0 | Pagination offset |

#### Response
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "AV-001",
        "title": "Add Yield Farming Strategy for MASSA-ETH Pair",
        "description": "Proposal to integrate new yield farming...",
        "status": "active",
        "proposer": "0xabc123...",
        "createdAt": "2025-01-20T10:00:00Z",
        "votingEnds": "2025-01-27T10:00:00Z",
        "votes": {
          "for": 456789,
          "against": 129456,
          "total": 586245
        },
        "quorum": {
          "required": 500000,
          "current": 586245,
          "percentage": 85.2
        },
        "category": "strategy_addition"
      }
    ],
    "pagination": {
      "total": 23,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Vote on Proposal
Cast a vote on a governance proposal.

```http
POST /governance/proposals/{proposalId}/vote
```

#### Request Body
```json
{
  "vote": "for", // "for" or "against"
  "amount": 1000 // VAULT tokens to vote with
}
```

### Create Proposal
Submit a new governance proposal.

```http
POST /governance/proposals
```

#### Request Body
```json
{
  "title": "Proposal Title",
  "description": "Detailed proposal description...",
  "category": "strategy_addition",
  "parameters": {
    "strategyAddress": "0x123...",
    "riskScore": 7,
    "maxAllocation": 1000000
  },
  "votingPeriod": 604800 // 7 days in seconds
}
```

## Analytics API

### Get Protocol Metrics
Retrieve overall protocol analytics.

```http
GET /analytics/protocol
```

#### Response
```json
{
  "success": true,
  "data": {
    "tvl": {
      "current": 2456789,
      "change24h": 12.5,
      "change7d": 8.3
    },
    "averageApy": {
      "current": 18.7,
      "weighted": 16.2
    },
    "users": {
      "total": 1247,
      "active24h": 89,
      "new7d": 156
    },
    "volume": {
      "deposits24h": 125000,
      "withdrawals24h": 87000,
      "rebalances24h": 45
    },
    "strategies": {
      "total": 8,
      "active": 6,
      "averageApy": 18.7
    }
  }
}
```

### Get Strategy Analytics
Analytics for all strategies.

```http
GET /analytics/strategies
```

#### Response
```json
{
  "success": true,
  "data": {
    "strategies": [
      {
        "id": "massa-usdc-lp",
        "name": "MASSA-USDC LP",
        "tvl": 1200000,
        "apy": 24.5,
        "users": 234,
        "performance": {
          "1d": 0.067,
          "7d": 0.45,
          "30d": 1.89
        },
        "risk": {
          "score": 6,
          "volatility": 15.2,
          "maxDrawdown": 8.7
        }
      }
    ]
  }
}
```

### Get User Analytics
Detailed analytics for a specific user.

```http
GET /analytics/users/{address}
```

#### Response
```json
{
  "success": true,
  "data": {
    "portfolio": {
      "totalValue": 12456.78,
      "totalReturns": 2456.78,
      "totalReturnsPercentage": 24.57
    },
    "performance": {
      "sharpeRatio": 1.45,
      "maxDrawdown": 5.2,
      "volatility": 12.8,
      "alpha": 3.2,
      "beta": 0.85
    },
    "activity": {
      "totalDeposits": 15,
      "totalWithdrawals": 3,
      "rebalances": 12,
      "governanceVotes": 8
    },
    "rewards": {
      "totalEarned": 156.78,
      "totalClaimed": 100.00,
      "currentRate": 0.25
    }
  }
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.autovault.massa.net/v1/ws');
```

### Authentication
```json
{
  "type": "auth",
  "data": {
    "token": "jwt_token",
    "address": "wallet_address"
  }
}
```

### Subscribe to Events
```json
{
  "type": "subscribe",
  "data": {
    "channels": ["portfolio", "strategies", "governance"]
  }
}
```

### Event Types

#### Portfolio Updates
```json
{
  "type": "portfolio_update",
  "data": {
    "address": "0x123...",
    "totalValue": 12456.78,
    "change": 123.45,
    "timestamp": "2025-01-27T10:30:00Z"
  }
}
```

#### Strategy Performance
```json
{
  "type": "strategy_update",
  "data": {
    "strategyId": "massa-usdc-lp",
    "apy": 24.5,
    "tvl": 1200000,
    "timestamp": "2025-01-27T10:30:00Z"
  }
}
```

#### Governance Events
```json
{
  "type": "proposal_update",
  "data": {
    "proposalId": "AV-001",
    "votes": {
      "for": 456789,
      "against": 129456
    },
    "timestamp": "2025-01-27T10:30:00Z"
  }
}
```

## Error Handling

### Error Codes
| Code | Description |
|------|-------------|
| INVALID_ADDRESS | Wallet address format invalid |
| INSUFFICIENT_BALANCE | Not enough balance for operation |
| STRATEGY_NOT_FOUND | Strategy ID does not exist |
| PROPOSAL_NOT_ACTIVE | Cannot vote on inactive proposal |
| RATE_LIMIT_EXCEEDED | Too many requests |
| UNAUTHORIZED | Authentication failed |
| VALIDATION_ERROR | Request validation failed |

### Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient MASSA balance for deposit",
    "details": {
      "required": 1000,
      "available": 750,
      "asset": "MASSA"
    }
  },
  "timestamp": "2025-01-27T10:30:00Z"
}
```

## Rate Limiting

### Limits
- **General API**: 100 requests per minute
- **Portfolio API**: 60 requests per minute
- **Analytics API**: 30 requests per minute
- **WebSocket**: 1000 messages per minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643284800
```

## SDK Examples

### JavaScript SDK
```javascript
import { AutoVaultSDK } from '@autovault/sdk';

const sdk = new AutoVaultSDK({
  apiUrl: 'https://api.autovault.massa.net/v1',
  wallet: walletInstance
});

// Get portfolio
const portfolio = await sdk.portfolio.get(address);

// Deposit assets
const deposit = await sdk.portfolio.deposit({
  amount: 1000,
  asset: 'MASSA',
  riskProfile: 'balanced'
});

// Subscribe to updates
sdk.on('portfolio_update', (data) => {
  console.log('Portfolio updated:', data);
});
```

### Python SDK
```python
from autovault import AutoVaultSDK

sdk = AutoVaultSDK(
    api_url='https://api.autovault.massa.net/v1',
    wallet=wallet_instance
)

# Get portfolio
portfolio = sdk.portfolio.get(address)

# Get strategies
strategies = sdk.strategies.list(risk_profile='balanced')

# Vote on proposal
vote = sdk.governance.vote('AV-001', 'for', amount=1000)
```

### Response Schemas

#### Portfolio Schema
```typescript
interface Portfolio {
  totalValue: number;
  totalDeposited: number;
  totalEarned: number;
  performance24h: {
    absolute: number;
    percentage: number;
  };
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  allocations: Allocation[];
  rewards: {
    vault: {
      earned: number;
      claimed: number;
      pending: number;
    };
  };
}
```

#### Strategy Schema
```typescript
interface Strategy {
  id: string;
  name: string;
  protocol: string;
  category: string;
  currentApy: number;
  riskScore: number;
  tvl: number;
  description: string;
  requirements: {
    minDeposit: number;
    supportedAssets: string[];
  };
  metrics: {
    volume24h: number;
    fees24h: number;
    impermanentLoss: number;
  };
}
```

This API reference provides comprehensive documentation for integrating with the AutoVault protocol programmatically. All endpoints are designed to be RESTful, secure, and provide detailed response data for building sophisticated DeFi applications.