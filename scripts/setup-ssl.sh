#!/bin/bash

# SSL Certificate Setup Script for Creator AI Production Deployment
# This script sets up SSL certificates using Let's Encrypt

set -e

DOMAIN="hanh-io-company-limitedorg.org"
EMAIL="admin@hanh-io-company-limited.com"
SSL_DIR="/opt/creator-ai/ssl"

echo "🔐 Setting up SSL certificates for Creator AI deployment..."

# Create SSL directories
mkdir -p "$SSL_DIR/certs"
mkdir -p "$SSL_DIR/private"
mkdir -p "$SSL_DIR/archive"
mkdir -p "$SSL_DIR/live"

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    
    # For Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    
    # For CentOS/RHEL
    elif command -v yum &> /dev/null; then
        yum install -y epel-release
        yum install -y certbot python3-certbot-nginx
    
    # For Amazon Linux
    elif command -v amazon-linux-extras &> /dev/null; then
        amazon-linux-extras install -y epel
        yum install -y certbot python3-certbot-nginx
    
    else
        echo "❌ Unsupported operating system. Please install certbot manually."
        exit 1
    fi
fi

# Generate SSL certificate using Let's Encrypt
echo "🔑 Generating SSL certificate for $DOMAIN..."

# Use standalone mode for initial certificate generation
certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domains "$DOMAIN" \
    --domains "www.$DOMAIN" \
    --cert-path "$SSL_DIR/certs/${DOMAIN}.crt" \
    --key-path "$SSL_DIR/private/${DOMAIN}.key" \
    --fullchain-path "$SSL_DIR/certs/${DOMAIN}-fullchain.crt" \
    --chain-path "$SSL_DIR/certs/${DOMAIN}-chain.crt"

# Copy certificates to the expected locations
cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/certs/${DOMAIN}.crt"
cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/private/${DOMAIN}.key"

# Set proper permissions
chmod 644 "$SSL_DIR/certs/${DOMAIN}.crt"
chmod 600 "$SSL_DIR/private/${DOMAIN}.key"
chown root:root "$SSL_DIR/certs/${DOMAIN}.crt"
chown root:root "$SSL_DIR/private/${DOMAIN}.key"

# Create renewal script
cat > "$SSL_DIR/renew-ssl.sh" << EOF
#!/bin/bash
# SSL Certificate Renewal Script

echo "🔄 Renewing SSL certificates..."

# Renew certificate
certbot renew --quiet --no-self-upgrade

# Copy renewed certificates
cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/certs/${DOMAIN}.crt"
cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/private/${DOMAIN}.key"

# Reload nginx in docker container
docker exec creator-ai-nginx nginx -s reload

echo "✅ SSL certificates renewed successfully"
EOF

chmod +x "$SSL_DIR/renew-ssl.sh"

# Add cron job for automatic renewal
if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
    echo "⏰ Setting up automatic SSL renewal..."
    (crontab -l 2>/dev/null; echo "0 3 * * 0 $SSL_DIR/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1") | crontab -
fi

# Test SSL configuration
echo "🧪 Testing SSL certificate..."
openssl x509 -in "$SSL_DIR/certs/${DOMAIN}.crt" -text -noout | grep -E "(Subject:|Issuer:|Not After)"

echo "✅ SSL certificates setup completed successfully!"
echo "📁 Certificates location: $SSL_DIR"
echo "🔄 Renewal script: $SSL_DIR/renew-ssl.sh"
echo "⏰ Auto-renewal: Every Sunday at 3 AM"

# Create SSL verification script
cat > "$SSL_DIR/verify-ssl.sh" << EOF
#!/bin/bash
# SSL Certificate Verification Script

echo "🔍 Verifying SSL certificate for $DOMAIN..."

# Check certificate expiration
openssl x509 -in "$SSL_DIR/certs/${DOMAIN}.crt" -noout -dates

# Check if certificate is valid
openssl verify "$SSL_DIR/certs/${DOMAIN}.crt"

# Test HTTPS connection
curl -I "https://$DOMAIN" --max-time 10

echo "✅ SSL verification completed"
EOF

chmod +x "$SSL_DIR/verify-ssl.sh"

echo "🔍 SSL verification script created: $SSL_DIR/verify-ssl.sh"