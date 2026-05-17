#!/bin/bash
# Trivy Security Scanner Script
# Scans Docker images for vulnerabilities

set -e

echo "========================================"
echo "  Trivy Image Security Scanner"
echo "========================================"

IMAGES=("ecommerce/frontend:latest" "ecommerce/product-service:latest" "ecommerce/cart-service:latest" "ecommerce/order-service:latest" "ecommerce/payment-service:latest")

for image in "${IMAGES[@]}"; do
    echo ""
    echo "----------------------------------------"
    echo " Scanning: $image"
    echo "----------------------------------------"
    
    # Check if trivy is installed
    if command -v trivy &> /dev/null; then
        trivy image \
            --severity HIGH,CRITICAL \
            --no-progress \
            --exit-code 0 \
            "$image"
    else
        echo "  Trivy not installed. Install with:"
        echo "  sudo apt-get install trivy"
        echo "  OR: docker run aquasec/trivy image $image"
        break
    fi
done

echo ""
echo "========================================"
echo "  Trivy Scan Complete"
echo "========================================"
