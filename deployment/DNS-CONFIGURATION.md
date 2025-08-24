# DNS Configuration for Creator AI Production Deployment

## Domain: hanh-io-company-limitedorg.org
## Server IP: 150.95.109.182

This document provides the DNS configuration required to connect the Creator AI system to the domain `hanh-io-company-limitedorg.org` pointing to server IP `150.95.109.182`.

## Required DNS Records

### A Records
Configure the following A records in your DNS management system:

```
# Primary domain
hanh-io-company-limitedorg.org.    300    IN    A    150.95.109.182

# WWW subdomain
www.hanh-io-company-limitedorg.org.    300    IN    A    150.95.109.182
```

### CNAME Records (Alternative to WWW A record)
Instead of the WWW A record, you can use a CNAME:

```
www.hanh-io-company-limitedorg.org.    300    IN    CNAME    hanh-io-company-limitedorg.org.
```

### Additional Recommended Records

#### MX Records (for email)
```
hanh-io-company-limitedorg.org.    300    IN    MX    10    mail.hanh-io-company-limitedorg.org.
```

#### TXT Records (for domain verification and security)
```
# SPF record for email security
hanh-io-company-limitedorg.org.    300    IN    TXT    "v=spf1 include:_spf.google.com ~all"

# Domain verification (example)
hanh-io-company-limitedorg.org.    300    IN    TXT    "google-site-verification=your_verification_code"
```

## DNS Provider Configuration Examples

### Cloudflare
1. Log in to Cloudflare dashboard
2. Select your domain `hanh-io-company-limitedorg.org`
3. Go to DNS settings
4. Add the following records:
   - Type: A, Name: @, Value: 150.95.109.182, TTL: Auto
   - Type: A, Name: www, Value: 150.95.109.182, TTL: Auto

### AWS Route 53
1. Open Route 53 console
2. Select your hosted zone
3. Create record sets:
   ```
   Name: hanh-io-company-limitedorg.org
   Type: A
   Value: 150.95.109.182
   
   Name: www.hanh-io-company-limitedorg.org
   Type: A
   Value: 150.95.109.182
   ```

### Google Cloud DNS
1. Go to Cloud DNS console
2. Select your DNS zone
3. Add record sets:
   ```
   DNS Name: hanh-io-company-limitedorg.org.
   Resource Record Type: A
   IPv4 Address: 150.95.109.182
   
   DNS Name: www.hanh-io-company-limitedorg.org.
   Resource Record Type: A
   IPv4 Address: 150.95.109.182
   ```

### GoDaddy
1. Log in to GoDaddy account
2. Go to DNS Management
3. Add A records:
   - Host: @, Points to: 150.95.109.182, TTL: 1 Hour
   - Host: www, Points to: 150.95.109.182, TTL: 1 Hour

### Namecheap
1. Log in to Namecheap account
2. Go to Domain List → Manage
3. Navigate to Advanced DNS
4. Add A records:
   - Type: A Record, Host: @, Value: 150.95.109.182, TTL: Automatic
   - Type: A Record, Host: www, Value: 150.95.109.182, TTL: Automatic

## DNS Propagation

After configuring DNS records:

1. **Propagation Time**: DNS changes can take 24-48 hours to propagate globally
2. **TTL Settings**: Use lower TTL values (300 seconds) during initial setup for faster changes
3. **Testing**: Use online tools to check DNS propagation:
   - https://dnschecker.org/
   - https://www.whatsmydns.net/

## DNS Verification Commands

Use these commands to verify DNS configuration:

### Check A Record
```bash
# Primary domain
dig hanh-io-company-limitedorg.org A
nslookup hanh-io-company-limitedorg.org

# WWW subdomain
dig www.hanh-io-company-limitedorg.org A
nslookup www.hanh-io-company-limitedorg.org
```

### Check from different DNS servers
```bash
# Google DNS
dig @8.8.8.8 hanh-io-company-limitedorg.org A

# Cloudflare DNS
dig @1.1.1.1 hanh-io-company-limitedorg.org A

# OpenDNS
dig @208.67.222.222 hanh-io-company-limitedorg.org A
```

### Trace DNS resolution
```bash
dig +trace hanh-io-company-limitedorg.org A
```

## SSL Certificate Requirements

Once DNS is configured and pointing to the server:

1. **Domain Validation**: Let's Encrypt will verify domain ownership via HTTP challenge
2. **Certificate Generation**: The deployment script will automatically generate SSL certificates
3. **Automatic Renewal**: Certificates will auto-renew every 90 days

## Firewall Configuration

Ensure the following ports are open on server 150.95.109.182:

```bash
# HTTP (for Let's Encrypt validation and redirect)
80/tcp

# HTTPS (for secure application access)
443/tcp

# SSH (for server management)
22/tcp
```

## Health Check URLs

After deployment, these URLs should be accessible:

- **Main Application**: https://hanh-io-company-limitedorg.org
- **API Health Check**: https://hanh-io-company-limitedorg.org/api/health
- **System Health**: https://hanh-io-company-limitedorg.org/health

## Troubleshooting DNS Issues

### Common Problems

1. **DNS not propagating**:
   - Wait 24-48 hours for full propagation
   - Clear local DNS cache: `sudo systemctl flush-dns` (Linux) or `ipconfig /flushdns` (Windows)

2. **Wrong IP address returned**:
   - Verify DNS records in provider dashboard
   - Check for typos in IP address (150.95.109.182)

3. **SSL certificate errors**:
   - Ensure DNS is pointing to correct IP before running SSL setup
   - Check that ports 80 and 443 are accessible

### DNS Cache Clearing

```bash
# Linux
sudo systemctl flush-dns
sudo resolvectl flush-caches

# macOS
sudo dscacheutil -flushcache

# Windows
ipconfig /flushdns
```

## Monitoring DNS Status

Create a monitoring script to check DNS resolution:

```bash
#!/bin/bash
# DNS Monitoring Script

DOMAIN="hanh-io-company-limitedorg.org"
EXPECTED_IP="150.95.109.182"

ACTUAL_IP=$(dig +short "$DOMAIN" A | head -1)

if [ "$ACTUAL_IP" = "$EXPECTED_IP" ]; then
    echo "✅ DNS resolution correct: $DOMAIN → $ACTUAL_IP"
else
    echo "❌ DNS resolution incorrect: $DOMAIN → $ACTUAL_IP (expected: $EXPECTED_IP)"
fi
```

## Security Considerations

1. **Enable DNSSEC** if your DNS provider supports it
2. **Use CAA records** to restrict SSL certificate authorities:
   ```
   hanh-io-company-limitedorg.org.    300    IN    CAA    0 issue "letsencrypt.org"
   ```

3. **Monitor DNS changes** with DNS monitoring services
4. **Use subresource integrity** for external assets

## Next Steps

1. Configure DNS records as specified above
2. Wait for DNS propagation (test with `dig` commands)
3. Run the production deployment script
4. Verify SSL certificate generation
5. Test application accessibility at https://hanh-io-company-limitedorg.org