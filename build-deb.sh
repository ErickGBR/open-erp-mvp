#!/usr/bin/env bash
set -euo pipefail

echo "📦 Building Open ERP DEB package..."

# Clean
rm -rf /tmp/openerp-deb-build
mkdir -p /tmp/openerp-deb-build

# Copy DEBIAN
cp -r deb-package/DEBIAN /tmp/openerp-deb-build/

# Create directories
mkdir -p /tmp/openerp-deb-build/opt/openerp
mkdir -p /tmp/openerp-deb-build/usr/local/bin
mkdir -p /tmp/openerp-deb-build/usr/share/openerp
mkdir -p /tmp/openerp-deb-build/etc/systemd/system

# Copy installation scripts
cp scripts/install-wizard.sh /tmp/openerp-deb-build/usr/share/openerp/
cp scripts/openerp-cli.sh /tmp/openerp-deb-build/usr/local/bin/openerp
chmod +x /tmp/openerp-deb-build/usr/local/bin/openerp

# Copy install.sh as openerp-install
cp install.sh /tmp/openerp-deb-build/usr/local/bin/openerp-install
chmod +x /tmp/openerp-deb-build/usr/local/bin/openerp-install

# Copy systemd service
cp systemd/openerp.service /tmp/openerp-deb-build/etc/systemd/system/

# Set permissions
chmod 755 /tmp/openerp-deb-build/DEBIAN/postinst
chmod 755 /tmp/openerp-deb-build/DEBIAN/prerm

# Build package
dpkg-deb --build /tmp/openerp-deb-build "openerp-v1.0.0.deb"

echo "✅ Package built: openerp-v1.0.0.deb"
echo ""
echo "Install with: sudo dpkg -i openerp-v1.0.0.deb"
