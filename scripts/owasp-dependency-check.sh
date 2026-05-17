#!/bin/bash
# OWASP Dependency Check Script
# This script checks for known vulnerabilities in project dependencies

set -e

echo "========================================"
echo "  OWASP Dependency Check"
echo "========================================"

SERVICES=("product-service" "cart-service" "order-service" "payment-service" "frontend")

for service in "${SERVICES[@]}"; do
    echo ""
    echo "----------------------------------------"
    echo " Checking: $service"
    echo "----------------------------------------"
    
    if [ -f "$service/package.json" ]; then
        echo "→ Running npm audit on $service..."
        cd "$service"
        
        # Install dependencies first
        npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps 2>/dev/null
        
        # Run npm audit
        AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || true)
        
        if [ -n "$AUDIT_OUTPUT" ]; then
            VULN_COUNT=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities // {} | .high + .critical' 2>/dev/null || echo "0")
            TOTAL_VULN=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities // {} | .total' 2>/dev/null || echo "0")
            
            echo "  Total vulnerabilities: $TOTAL_VULN"
            echo "  High/Critical: $VULN_COUNT"
            
            # Fail if high/critical vulnerabilities found
            if [ "$VULN_COUNT" -gt 0 ] 2>/dev/null; then
                echo "  ⚠ WARNING: $VULN_COUNT high/critical vulnerabilities found!"
                echo "  Run 'npm audit fix' to resolve them."
            fi
        fi
        
        cd ..
    else
        echo "→ No package.json found, skipping..."
    fi
done

echo ""
echo "========================================"
echo "  OWASP Dependency Check Complete"
echo "========================================"
