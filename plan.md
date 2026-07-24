# PLAN DE EJECUCIÓN — Open ERP MVP

## Fase 1: Bug Hunting Completo
- [x] ~~Módulo RH~~ (5 bugs encontrados y corregidos)
- [ ] Módulo Warehouse (inventarios, ubicaciones)
- [ ] Módulo Accounts (plan de cuentas)
- [ ] Módulo Dashboard (estadísticas)
- [ ] Módulo Auth (autenticación, registro)
- [ ] Módulo Products (productos, stock)
- [ ] Módulo Sales (ventas, facturación)
- [ ] Módulo Customers (clientes)
- [ ] Módulo Kardex (movimientos)

## Fase 2: Corrección de Bugs
- [ ] Cada bug: fix → commit → push (individual)
- [ ] Compilar y verificar servidor fresh

## Fase 3: QA Tests
- [ ] Ejecutar Playwright completo
- [ ] Verificar 11/11 tests PASS

## Fase 4: Screenshots
- [ ] Navegar cada módulo y capturar
- [ ] Dashboard general
- [ ] Products + Warehouse
- [ ] Sales + Customers
- [ ] Accounts + Company
- [ ] RH (empleados, nómina, asistencia)
- [ ] POS
- [ ] Settings
- [ ] Landing page hero

## Fase 5: README — Carrusel Dinámico
- [ ] Agregar slider/carrusel con CSS nativo
- [ ] Efectos de barrido y sombras glow
- [ ] Animaciones scroll-based
- [ ] Sin dependencias JS externas

## Fase 6: Landing Page (GitHub Pages) — docs/index.html
- [ ] Agregar carrusel de screenshots
- [ ] Efectos glassmorphism + sweep
- [ ] Animaciones al hacer scroll

## Fase 7: Landing Page (App) — frontend/src/app/page.tsx
- [ ] Agregar carrusel con efectos dinámicos
- [ ] Sombras, sweep, transiciones suaves
- [ ] Responsive design

## Reglas
- NO subir plan.md a git (.gitignore ya lo cubre?)
- Cada cambio = commit individual con mensaje claro
- No preguntar al operador — ejecutar y luego reportar
