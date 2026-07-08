# Migrar de `@bienflow/ui-kit` a `@lindaui`

> Guía para `gym-ecosystem` (`apps/job-agent/web`, `apps/lead-converter/web`). Describe
> CÓMO migrar; NO se ejecuta desde este repo — `ts-package` solo construyó los huecos
> que faltaban en `@lindaui` para que esta migración sea posible (ver `.changeset/`
> `gap-fill-phase-{a,b,c}.md`). Ejecutar en el repo `gym-ecosystem`.

## Por qué es barato

`@bienflow/ui-kit` y `@lindaui/ui` envuelven la **misma librería base — HeroUI v3
(react-aria-components)**. La migración NO es reescribir componentes: es (1) cambiar
imports/props a la API de `@lindaui` y (2) resolver los pocos casos con acoplamiento a
dominio (CRM de leads) que no tienen sentido en una librería genérica.

## 1. Dependencias

```diff
- "@bienflow/ui-kit": "workspace:*"
+ "@lindaui/ui": "^0.3.0"
+ "@lindaui/blocks": "^0.3.0"
+ "@lindaui/tokens": "^0.3.0"
```

`react-hook-form` ya es dependencia de ambos apps (usado hoy). No hace falta `dayjs`,
`framer-motion` ni `recharts` como deps directas del app salvo que uses los chart
blocks (`recharts` es peer de `@lindaui/blocks`) — `@lindaui/ui`/`@lindaui/blocks` no
necesitan `@internationalized/date`/`@react-types/shared` para lo que ui-kit usaba
(`TimeRangePicker` de ui-kit los pedía; el de `@lindaui/blocks` usa `<input
type="date">` nativo, ver tabla de componentes más abajo).

## 2. CSS — diferencia arquitectónica clave

`@bienflow/ui-kit` **no shippea CSS compilado**: cada app escanea el `src` del paquete
con `@source` y lo compila con su propio pase de Tailwind. `@lindaui/tokens` en cambio
shippea un **`dist/index.css` ya compilado** (`@lindaui/tokens/css`) — no hay nada que
escanear del lado de la librería.

`apps/{job-agent,lead-converter}/web/src/app/globals.css` hoy:

```css
@import "tailwindcss";
@import "@heroui/styles";
@source "../../node_modules/@bienflow/ui-kit/src/**/*.{ts,tsx}";

@theme {
  --accent: oklch(...); /* naranja en job-agent, violeta en lead-converter */
  ...
}
```

Pasa a:

```css
@import "tailwindcss";
@import "@lindaui/tokens/css"; /* ya trae @heroui/styles + tokens base + utilities */

:root {
  /* pisar SOLO los canónicos — nunca las vars nativas de HeroUI ni --color-* */
  --primary: oklch(...); /* el --accent de hoy, mapeado al canónico de @lindaui */
  --primary-foreground: ...;
  --ring: ...;
}
.dark {
  --primary: oklch(...);
  --ring: ...;
}
```

Puntos importantes:

- **Borrar** el `@source` de `@bienflow/ui-kit` — ya no existe ese paquete.
- **Borrar** `@import "@heroui/styles"` directo — `@lindaui/tokens/css` ya lo incluye.
  Si lo dejás, HeroUI se importa dos veces (inofensivo pero redundante).
- **No hace falta un `@source` para `@lindaui`** — a diferencia de ui-kit, la lib no
  se escanea en el consumidor; el CSS ya viene resuelto.
- El código de la app (`app/**/*.tsx`, etc.) sigue escaneándose solo por la
  detección automática de Tailwind v4 (no requiere `@source` propio salvo que el
  código viva fuera del árbol por defecto).
- Mapear el `--accent` (nombre HeroUI-nativo que ui-kit sobreescribía) al canónico
  **`--primary`** de `@lindaui` — es el que hay que pisar, no `--accent` (`--accent`
  en `@lindaui/tokens` es una *ref* a `--primary`, pisarlo directamente rompe la
  cadena). Ver `packages/tokens/theme-template.css` en este repo como referencia de
  qué canónicos existen.
- El orden importa: el override va **después** de `@import "@lindaui/tokens/css"`.

## 3. Codemap de API por componente

| ui-kit | `@lindaui` | Cambios |
|---|---|---|
| `Button` | `@lindaui/ui/button` | `color`+`variant` (ej. `color="danger" variant="solid"`) → un solo `variant`: `primary\|secondary\|ghost\|danger\|link`. `onPress` se mantiene (ya era RAC). |
| `IconButton` | `@lindaui/ui/icon-button` | Mismo concepto (`isIconOnly` + `aria-label` requerido). API casi 1:1. |
| `Input` | `@lindaui/ui/input` | `onValueChange(value)` → `onChange(value)`. **`className` no existe** (rechazado a propósito) — estilizar via `--field-*` tokens. `startContent`/`endContent`/`description`/`errorMessage`/`isInvalid` sí existen (agregados en `gap-fill-phase-a`). |
| `SearchInput` | `@lindaui/ui/search-field` | Trae lupa + botón de limpiar por default (antes explícito). `onValueChange`→`onChange`. El matching de texto (`normalizeText`/`matchesSearch`) vive en `@lindaui/ui/search`. |
| `Badge` (genérica) | `@lindaui/ui/badge` | `variant`: `default\|success\|warning\|danger\|info` (antes `color`). Sin `dot`/close — para un badge cerrable usar `@lindaui/ui/chip`. |
| `Avatar` | `@lindaui/ui/avatar` | Solo expone el Root de HeroUI — sin `.Image`/`.Fallback`, no hay fallback-on-error real. Para conversaciones/chat, usar `@lindaui/blocks/chat-avatar` en su lugar (bespoke, con fallback a iniciales y `onError`). |
| `Icon` (wrapper de lucide) | — | No hay wrapper en `@lindaui`. Usar `lucide-react` directo con clases Tailwind (`<Search className="size-4" />`); es el patrón de toda la lib. |
| `Spinner`, `Divider`, `Text`/`Heading`/`Code` | homónimos en `@lindaui/ui` | Casi 1:1. `Divider` = `Separator` de HeroUI (rename interno, mismo nombre público). |
| `Checkbox`/`Radio`/`Switch`/`Slider` | homónimos | `onValueChange`→`onChange` en todos. |
| `SemanticBadge` | — (app-local) | Acoplado a dominio (status/source/temperatura de lead). Reconstruir en el app componiendo `@lindaui/ui/badge` o `chip` + tu propio mapa de colores/labels. |
| `StatusFilters` | — (app-local, patrón ya resuelto) | El patrón de "tabs de filtro" ya existe embebido en `@lindaui/blocks/list-pane` (prop `filters`) y `table-pane`. Si necesitás standalone, copiá ese patrón (botones `variant={active?"primary":"ghost"}`), no hay un componente separado. |
| `KPICard` | `@lindaui/blocks/stat-card` | `icon: LucideIcon` (tipo-componente) → `icon: ReactNode` (pasá `<Icon/>` ya renderizado). `trend:{value,isPositive}` → `delta:{value,trend:"up"\|"down"\|"neutral"}`. `isLoading` → `loading` (ahora soportado, `gap-fill-phase-c`). `color` → `tone` (solo aplica con `variant="featured"`). |
| `ImageLightbox` | `@lindaui/blocks/image-viewer` + tu propio `dialog` | `image-viewer` es un visor full-bleed (zoom, controles), no un modal thumbnail→fullscreen en sí mismo. Para el patrón lightbox, envolvé `image-viewer` en `@lindaui/ui/dialog` vos mismo (2-3 líneas) — evita duplicar un componente de modal solo para esto. |
| `WhatsAppAudioPlayer` | `@lindaui/blocks/audio-player` | Genérico (sin branding WhatsApp explícito, aunque visualmente similar — burbuja + waveform + duración). Mismo concepto. |
| `AnalyticsCard` | `@lindaui/blocks/chart-card` | Mismo shell (title/description/action/footer/children). |
| `AnalyticsSkeleton`/`FetchingIndicator` | `@lindaui/ui/skeleton` + `@lindaui/blocks/fetching-indicator` | `FetchingIndicator` 1:1. El skeleton de carga completa: usar `@lindaui/ui/skeleton` directo o el `loading` de `stat-card`. |
| `StatusDistributionChart` | `@lindaui/blocks/bar-chart` | API flat `data`+`config`+`categoryKey`+`series` (antes composición manual de recharts). |
| `TopEntitiesTable` | `@lindaui/blocks/table-pane` | `columns`/`rows` declarativo; las celdas son `ReactNode` (vos armás chips/avatares). Trae además chrome de filtros/búsqueda que `TopEntitiesTable` no tenía — opcional, podés no usar `filters`/`searchValue`. |
| `EntityHealthCard` (ex-`GymHealthCard`) | `@lindaui/blocks/entity-health-card` | Mismo concepto generalizado (`items: {id,label,value,status?,statusLabel?}[]`). |
| `TimeRangePicker` | `@lindaui/blocks/time-range-picker` | Antes usaba HeroUI `DateRangePicker`+`RangeCalendar`+`@internationalized/date`. El de `@lindaui` usa `<input type="date">` nativo para el rango custom — más simple, sin esa dependencia. Si necesitás un calendario visual, componé vos `@lindaui/ui/date-range-picker` (compound re-export de HeroUI) en el slot custom. |
| `AiCostCard`, `AiPerformanceCard` | — (app-local) | Acoplados a métricas de lead/IA. Reconstruir componiendo `chart-card`+`stat-card`. |
| `ChatLayout`/`ChatHeader`/`ChatAvatar`/`ConversationList(Item)`/`ConversationThread`/`MessageBubble`/`MessageComposer`/`EmptyChatView`/`DateDivider`/`TimeDivider` | `@lindaui/blocks/chat-*` (`chat-layout`, `chat-header`, `chat-avatar`, `conversation-list`, `conversation-list-item`, `conversation-thread`, `message-bubble`, `message-composer`, `empty-chat-view`, `chat-date-divider`, `chat-time-divider`) | Mapear tu `Message`/`Lead` a los tipos de `@lindaui/blocks/chat-types`: `GenericMessage` (`id`,`side:"incoming"\|"outgoing"`,`text?`,`media?`,`sentAt`,`status?`) y `ConversationSummary` (`id`,`title`,`subtitle?`,`avatarUrl?`,`lastMessageAt?`,`unreadCount?`) — mismo espíritu que tu `to-generic-message.ts` actual, solo cambia el shape destino. Sin `framer-motion` (las animaciones de `@lindaui` son CSS). |
| `useDebounce`, `usePrevious`, `useTheme`, `useMediaQuery`/`useIsDesktop`/`useIsMobile` | `@lindaui/ui/use-debounce`, `use-previous`, `use-theme`, `use-media-query` (+ `useIsTablet`, nuevo) | 1:1. `useTheme` togglea `.dark` en `<html>`, igual que hoy. |
| `cn` | `@lindaui/ui/cn` | 1:1 (misma base clsx+tailwind-merge). |
| `formatRelativeTime`/`formatShortTime`/`isToday`/`isYesterday` | `@lindaui/ui/date` | 1:1 en firma. **Sin `dayjs`** — `Intl`/`Date` nativos. |
| `formatCurrency`/`formatDate`/`formatPhone` | `@lindaui/ui/format` | `formatPhone` en `@lindaui` es agrupamiento genérico de dígitos (no un formateador E.164 por país) — si necesitás el formato argentino específico, mantenelo app-local. |
| time-grouping helpers | `@lindaui/ui/time-grouping` (`groupByDay`) | Usado internamente por `conversation-thread`; disponible suelto si lo necesitás para otra vista. |
| `tokens/*` (objetos TS: colors/spacing/typography/shadows/animations/breakpoints) | `@lindaui/tokens` (CSS vars) | Ya no son objetos JS importables — son variables CSS (`var(--primary)`, etc.). Si tenés código que lee `colors.primary[500]` en JS, hay que pasarlo a CSS (`className`/inline `style` con `var(--primary)`) o a Tailwind utilities (`bg-primary`). |

## 4. Lo que se reconstruye en el app (dominio, no entra a `@lindaui`)

Estos son específicos del CRM de leads y no tienen lugar en una librería genérica —
recrealos en `gym-ecosystem` componiendo primitivos de `@lindaui`:

- `SemanticBadge` (status/source/temperatura/ai-status/priority de lead)
- `StatusFilters` con los estados concretos de lead (patrón sí existe en `list-pane`)
- `AiCostCard`, `AiPerformanceCard`
- `colors.lead` / `colors.source` (mapas de color por estado/canal)
- `lead-avatar.tsx` / `message-bubble.tsx` (tus wrappers actuales que bindean datos de
  dominio a `ChatAvatar`/`MessageBubble` — se mantienen, solo cambia el import de base)

## 5. Piloto sugerido

Antes del sweep completo, migrar **un solo archivo** de bajo riesgo para validar el
flujo end-to-end:

1. `apps/lead-converter/web/.../admin-sidebar.tsx` — solo importa `Button`. Cambiar el
   import a `@lindaui/ui/button` y remover `color` si lo usaba.
2. Correr `pnpm --filter <app>-web typecheck` — debe quedar verde.
3. `pnpm --filter <app>-web dev` y verificar visualmente que el botón se ve igual
   (con el `--primary` de marca ya mapeado en `globals.css`).

Si el piloto pasa, seguir con el resto de los ~48 import-sites usando la tabla de la
sección 3, empezando por los primitivos (alto volumen, bajo riesgo) y dejando
`chat/`+`analytics/` para el final (mayor superficie, requieren el mapeo de tipos).
