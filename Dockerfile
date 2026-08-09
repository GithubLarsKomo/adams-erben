FROM node:22-alpine AS web-builder
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY scripts ./scripts
COPY src ./src

# Safe default: do not reuse/crawl the full DRV directory until the preferred
# data route has been agreed with the DRV (see Issue #1 and NOTICE.md).
ARG SKIP_DRV_SYNC=1
ARG REQUIRE_DRV_SYNC=0
ENV SKIP_DRV_SYNC=${SKIP_DRV_SYNC}
ENV REQUIRE_DRV_SYNC=${REQUIRE_DRV_SYNC}
RUN npm run build

FROM composer:2 AS php-deps
WORKDIR /app
COPY composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

FROM php:8.3-apache
RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install mbstring \
    && rm -rf /var/lib/apt/lists/* \
    && a2enmod headers

COPY docker/apache-security.conf /etc/apache2/conf-enabled/adams-erben-security.conf
COPY --from=web-builder /app/dist/ /var/www/html/
COPY api/ /var/www/html/api/
COPY legal/ /var/www/html/
COPY --from=web-builder /app/build-private/recipients.json /opt/adams-erben/recipients.json
COPY --from=php-deps /app/vendor/ /var/www/vendor/

RUN chown -R www-data:www-data /var/www/html /opt/adams-erben

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD php -r '$body=@file_get_contents("http://127.0.0.1/api/health.php"); exit($body===false ? 1 : 0);'
