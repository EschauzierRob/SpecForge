# Decisions

## D-0001
Use explicit module names aligned to target product capabilities (Domain/Application/Infrastructure/Backtesting/Strategies/LiveTrading/Api/Worker/Dashboard).

## D-0002
Keep bootstrapped implementations intentionally thin and named as placeholders/stubs to prevent false confidence.

## D-0003
Use EF Core + Npgsql as default persistence path and reserve Dapper/raw SQL for isolated query services.

## D-0004
Adopt agent-operable repo conventions early to support spec-driven development at scale.
