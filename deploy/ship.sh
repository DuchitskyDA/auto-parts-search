#!/usr/bin/env bash
# Сборка и выкладка статики на сервер: каталог /opt/partsearch/dist, его отдаёт контейнер из deploy/compose.yaml.
# Нужен SSH-доступ к хосту: DEPLOY_HOST (по умолчанию oby-core из ~/.ssh/config).
set -euo pipefail
cd "$(dirname "$0")/.."
host="${DEPLOY_HOST:-oby-core}"

npm ci
npm test
npm run build

tar -C dist -czf - . | ssh "$host" 'set -e
  rm -rf /opt/partsearch/dist.new && mkdir -p /opt/partsearch/dist.new
  tar -C /opt/partsearch/dist.new -xzf -
  rm -rf /opt/partsearch/dist.old
  mv /opt/partsearch/dist /opt/partsearch/dist.old && mv /opt/partsearch/dist.new /opt/partsearch/dist
  docker restart core-partsearch >/dev/null'
echo "Готово: https://parts-search.62-83-8-181.sslip.io/"
