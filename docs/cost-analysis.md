# Cost Analysis for Self-Hosting

This document provides a detailed cost analysis for deploying and running your own Directus Marketplace Search MCP Server instance on Cloudflare Workers.

## TL;DR

**Most users will stay on Cloudflare's free tier** (100% free, no credit card required for basic usage).

## Cloudflare Workers Pricing

### Free Tier

Cloudflare Workers offers an extremely generous free tier:

- **100,000 requests per day**
- **10 million requests per month**
- **10ms CPU time per request**
- **30 million CPU milliseconds per month**
- **No credit card required** for free tier

### Paid Tier ($5/month minimum)

Only charged if you exceed the free tier:

- **$5 per month** (minimum)
- **$0.50 per million requests** beyond the included 10M
- Additional CPU time included
- Advanced features available

## Cost Breakdown by Usage Level

### Individual Users (Light Usage)

**Profile:**
- 1-2 users
- 10-50 searches per day
- Occasional extension lookups

**Monthly Usage:**
- ~1,000 requests/month
- ~100 CPU milliseconds/month

**Cost:** **FREE** ✅
**Percentage of free tier used:** <0.01%

---

### Small Teams (5-10 users)

**Profile:**
- 5-10 developers
- 50-100 searches per day
- Regular extension discovery

**Monthly Usage:**
- ~3,000 requests/month
- ~300 CPU milliseconds/month

**Cost:** **FREE** ✅
**Percentage of free tier used:** 0.03%

---

### Medium Teams (50-100 users)

**Profile:**
- 50-100 developers
- 500-1000 searches per day
- Heavy extension research

**Monthly Usage:**
- ~30,000 requests/month
- ~3,000 CPU milliseconds/month

**Cost:** **FREE** ✅
**Percentage of free tier used:** 0.3%

---

### Large Teams (100-500 users)

**Profile:**
- 100-500 developers
- 2,000-5,000 searches per day
- Multiple AI assistants using the service

**Monthly Usage:**
- ~100,000 requests/month
- ~10,000 CPU milliseconds/month

**Cost:** **FREE** ✅
**Percentage of free tier used:** 1%

---

### Enterprise Usage (1000+ users)

**Profile:**
- 1000+ developers
- 50,000+ searches per day
- Company-wide AI integration

**Monthly Usage:**
- ~1,500,000 requests/month
- ~150,000 CPU milliseconds/month

**Cost:** **~$5-10/month** 💰
**Calculation:**
- Base: $5/month (minimum)
- Overage: Minimal (only if exceeding 10M requests)

---

### Very High Volume (Public Service)

**Profile:**
- Public-facing service
- 500,000+ searches per day
- 15 million requests/month

**Monthly Usage:**
- ~15,000,000 requests/month
- ~1,500,000 CPU milliseconds/month

**Cost:** **~$7.50/month** 💰
**Calculation:**
- Base: $5/month
- Overage: 5M requests × $0.50/M = $2.50

---

## Real-World Usage Examples

### Our Public Server

The public Directus Marketplace Search MCP Server processes:

- **~50,000 requests/month** (current)
- **~5,000 CPU milliseconds/month**
- **Cost:** **FREE** (well within free tier)

### Typical Self-Hosted Instance

Based on early adopter feedback:

- **~5,000-20,000 requests/month**
- **~500-2,000 CPU milliseconds/month**
- **Cost:** **FREE** for 99% of users

## Cost Comparison

### Self-Hosted vs. Alternatives

| Solution | Monthly Cost | Rate Limits | Performance | Setup Time |
|----------|-------------|-------------|-------------|------------|
| **Cloudflare Workers (Free)** | **$0** | 10M requests | Global edge | 5 minutes |
| **Cloudflare Workers (Paid)** | **$5-15** | Unlimited* | Global edge | 5 minutes |
| AWS Lambda (Free Tier) | $0 | 1M requests | Regional | 30 minutes |
| AWS Lambda (Paid) | $5-50+ | Pay per use | Regional | 30 minutes |
| Heroku | $7-25 | Unlimited | Regional | 15 minutes |
| Digital Ocean | $5-10 | Unlimited | Single region | 1 hour |
| VPS/Dedicated | $10-100+ | Unlimited | Single region | 2+ hours |

*Within reasonable usage; see Cloudflare Terms of Service

## Additional Cloudflare Costs

### Workers KV (Caching)

**Free Tier:**
- 100,000 reads per day
- 1,000 writes per day
- 1 GB stored data

**Paid Tier (if exceeded):**
- $0.50 per million reads
- $5.00 per million writes
- $0.50 per GB per month

**Typical Usage for MCP Server:**
- ~1,000 reads/day (caching search results)
- ~100 writes/day (cache updates)
- ~1 MB stored data

**Cost:** **FREE** ✅

### Bandwidth

**Included:** Unlimited bandwidth at no extra cost

## Cost Optimization Tips

### 1. Aggressive Caching

The MCP server uses Workers KV caching to minimize:
- External API calls
- CPU time
- Response latency

**Current cache settings:**
- Search results: 5 minutes TTL
- Extension details: 1 hour TTL

**Optimization:** Increase TTLs for even lower costs (if data freshness allows)

### 2. Rate Limiting (Optional)

While not required for cost reasons on self-hosted instances, rate limiting can:
- Prevent abuse
- Control usage patterns
- Protect against runaway costs

**Default limits (can be disabled):**
- 100 requests/hour per IP
- 500 requests/day per IP

### 3. Monitoring

Monitor your usage to stay informed:

**View usage:**
```bash
# Check deployment analytics
wrangler deployments list

# View real-time logs
wrangler tail

# Access admin stats
curl https://your-worker.workers.dev/admin/stats
```

**Set alerts:**
- Cloudflare dashboard provides usage alerts
- Set notification thresholds at 80% of free tier

## When Will You Need to Pay?

You'll only need to upgrade to paid if you:

1. **Exceed 10M requests/month** (~333,000 requests/day)
2. **Exceed 30M CPU milliseconds/month**
3. **Need advanced features** (not typical for this use case)

For context, 10M requests/month means:
- **~333 users making 1,000 searches each per month**
- **~10,000 users making 100 searches each per month**
- **~20,000+ developers in a large enterprise**

## Hidden Costs? None.

Unlike many cloud providers, Cloudflare has no hidden costs:

- ✅ **No bandwidth charges**
- ✅ **No NAT gateway charges**
- ✅ **No load balancer costs**
- ✅ **No SSL certificate fees**
- ✅ **No data transfer fees**
- ✅ **No cold start penalties**

## ROI Analysis

### Public Server Rate Limits

Using our public server:
- **Free:** 100 requests/hour (2,400/day)
- **Cost:** $0
- **Good for:** Individual users, small teams

### Self-Hosted Unlimited

Deploying your own instance:
- **Free:** Up to 10M requests/month
- **Cost:** $0 (likely stays free forever)
- **Setup time:** 5 minutes
- **Good for:** Teams, heavy users, enterprises

**ROI:** Infinite (free unlimited vs. free limited)

### When Self-Hosting Makes Sense

Consider self-hosting if you:
- ✅ Want **unlimited requests** without rate limits
- ✅ Need **guaranteed availability** for critical workflows
- ✅ Require **data privacy** and control
- ✅ Want to **customize** rate limits or features
- ✅ Have **multiple team members** using the service

## Scaling Scenarios

### Scenario 1: Startup Growth

**Year 1:** 10 developers → **FREE**
**Year 2:** 50 developers → **FREE**
**Year 3:** 200 developers → **FREE**
**Year 4:** 1,000 developers → **FREE** (probably)
**Year 5:** 5,000 developers → **~$5-10/month**

### Scenario 2: Enterprise Adoption

**Month 1:** Pilot team (20 users) → **FREE**
**Month 3:** Department rollout (200 users) → **FREE**
**Month 6:** Company-wide (2,000 users) → **FREE**
**Month 12:** Full adoption (10,000 users) → **~$5-15/month**

## Cost Forecast Calculator

Estimate your costs:

```
Monthly Requests = (Average searches per user per day × Number of users × 30 days)

Example: 50 searches/user/day × 100 users × 30 days = 150,000 requests/month

If Monthly Requests <= 10,000,000:
  Cost = $0 (FREE)
Else:
  Overage = Monthly Requests - 10,000,000
  Cost = $5 + (Overage / 1,000,000 × $0.50)
```

## Conclusion

**For 99% of users, self-hosting will be completely free** thanks to Cloudflare's generous free tier.

**Even for large enterprises with thousands of users,** the cost remains minimal ($5-15/month) compared to the value provided.

**There are no hidden costs,** and you can start on the free tier without providing a credit card.

**The setup takes less than 5 minutes,** making it one of the most cost-effective and easy-to-deploy MCP servers available.

## Resources

- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [Usage Monitoring Guide](../deploy/README.md#monitor-usage)

---

**Last Updated:** 2024-12-15
**Pricing accurate as of:** December 2024 (verify current pricing on Cloudflare website)
