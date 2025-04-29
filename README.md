# Тестирование проблем параллельного доступа Dirty Write и Lost Update

## Команды для запуска

DB:

```
docker compose -f pg.docker-compose.yml up
```

Script:

```
npm test dirty-write/one-connection-read-committed.ts
```
