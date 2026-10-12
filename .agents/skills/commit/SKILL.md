---
name: commit
description: >-
  Create atomic Git commits by inspecting changes, separating independent work,
  and writing Conventional Commits with emojis and Spanish messages by default.
  Use when the user asks to commit changes, split changes into commits, or says
  "commit", "commitea", or "haz commits".
license: MIT
metadata:
  author: francocarballar
  version: "1.1.0"
---

# Commit

Crear commits atómicos: cada commit representa una unidad lógica coherente,
revisable y reversible. Usar español y emojis por defecto; respetar el idioma y
las convenciones que el usuario o el repositorio indiquen.

## Alcance

Aplicar cuando el usuario pide crear commits o dividir cambios en commits. Si
solo pide proponer mensajes o un plan, entregar ese resultado sin crear commits.
Completar una feature o un fix no autoriza por sí mismo a commitear.

Antes de modificar el índice, identificar el repositorio y el alcance autorizado:
archivos concretos, cambios de la tarea o todos los cambios pendientes. Inventariar
todo el árbol para detectar trabajo ajeno, pero incluir solo el alcance pedido.
Si un cambio no puede atribuirse al alcance, conservarlo y consultar únicamente si
esa duda impide completar los commits solicitados.

## Reglas de agrupación

- Una feature o migración completa puede requerir varios commits. Separar las
  unidades lógicas más pequeñas que conserven sentido y puedan revisarse aparte.
- Mantener implementación y tests que prueban esa unidad en el mismo commit.
  Separar build/dependencias, harness, documentación y datos cuando sean
  independientes; una dependencia inseparable permanece con su consumidor.
- Asignar cada cambio autorizado a exactamente un grupo. Un archivo puede
  participar en varios grupos si sus hunks tienen propósitos distintos.
- Ordenar los commits por dependencia. Evitar fragmentos artificiales que dejen
  código incoherente o roto solo para aumentar la cantidad de commits.
- Respetar cambios previamente staged. Si el índice mezcla trabajo autorizado
  con trabajo ajeno, preservar su contenido y selección; consultar cuando no sea
  posible aislar el grupo sin alterar el trabajo del usuario.
- Excluir secretos y credenciales. Si un archivo autorizado los contiene,
  detener ese grupo y explicar el bloqueo sin reproducir los valores.
- No crear commits vacíos, alterar la identidad Git, reescribir historia ni hacer
  push sin autorización para esas acciones. Respetar hooks y verificaciones del
  repositorio; si fallan, resolver el fallo dentro del alcance o informar el bloqueo.

## Formato del mensaje

Seguir [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>(<scope>): <emoji> <descripción>

[cuerpo opcional: motivo y efectos relevantes]

[trailers aplicables]
```

El scope es opcional. El emoji va después de `: ` para que el mensaje comience con
el tipo y sea compatible con herramientas que procesan Conventional Commits.
Para cambios incompatibles, agregar `!` antes de `:` y explicar la incompatibilidad
en el cuerpo o en un trailer `BREAKING CHANGE:`.

| Tipo | Emoji | Uso |
|------|-------|-----|
| feat | ✨ | Nueva funcionalidad |
| fix | 🐛 | Corrección de bug |
| docs | 📝 | Documentación |
| style | 💄 | Formato o estilos sin cambios de comportamiento |
| refactor | ♻️ | Refactorización sin cambios de comportamiento |
| test | 🧪 | Tests |
| chore | 🔧 | Mantenimiento |
| perf | ⚡ | Rendimiento |
| build | 🏗️ | Sistema de build o dependencias |
| ci | 👷 | CI/CD |
| revert | ⏪ | Revertir un cambio |

Incluir `Co-Authored-By: Nombre <email>` cuando el usuario, el repositorio o el
entorno del agente lo requieran y la identidad esté disponible. Usar la identidad
real del colaborador o la atribución documentada del agente que participó; no
atribuir automáticamente el trabajo a Claude ni inventar nombres o correos.

## Flujo

1. **Inventariar**: revisar `git status --short --branch`, `git diff`,
   `git diff --cached` y `git ls-files --others --exclude-standard`. Inspeccionar
   también los archivos nuevos; considerar adiciones, borrados, renombres y
   binarios. Leer las instrucciones locales y las convenciones recientes de
   `git log` antes de decidir el formato.
2. **Planificar**: enumerar los grupos y sus paths/hunks antes de stagear.
   Agrupar por propósito o comportamiento, no solo por directorio o tipo de
   archivo. Marcar explícitamente los cambios fuera de alcance como preservados.
3. **Stagear un grupo**: usar `git add -- <paths>` o `git add -p -- <path>` para
   hunks independientes. Revisar `git diff --cached` completo y comprobar que
   contiene exactamente la unidad prevista. No usar `git add -A` como sustituto
   de la agrupación ni `git commit -a` para incorporar cambios sin revisar.
4. **Crear el commit**: ejecutar las verificaciones apropiadas que exija el
   repositorio o solicite el usuario. Usar un mensaje concreto que describa el
   cambio y, cuando aporte contexto, explicar el motivo en el cuerpo. Para
   mensajes multilínea, escribirlos en un archivo temporal y usar
   `git commit -F <archivo>` para evitar interpolaciones del shell.
5. **Reconciliar después de cada commit**: revisar el estado y los diffs restantes.
   Continuar con los grupos pendientes del inventario autorizado. Si aparecen
   cambios nuevos, revisar su origen y alcance antes de incorporarlos.
6. **Cerrar**: comprobar con `git status`, los diffs y los archivos untracked que
   todos los cambios autorizados quedaron cubiertos. Revisar `git log --oneline`
   y reportar hash, mensaje y verificaciones de cada commit, además de cualquier
   cambio preservado o bloqueo. Un árbol con trabajo fuera de alcance puede
   seguir sucio; no incorporarlo solo para dejarlo limpio.

## Ejemplo de mensaje

```text
feat(auth): ✨ permitir renovar sesiones vencidas

Renueva la sesión con el token existente para evitar que el usuario
pierda el formulario que estaba completando.
```
