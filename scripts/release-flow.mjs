// Automatiza el flujo de release de este monorepo: push a main -> esperar
// CI+Release -> si changesets crearon un "Version Packages" PR, esperar su
// CI (auto-reintentando el flake de `action_required` en PRs abiertos por el
// bot) -> mergearlo -> esperar el CI+Release post-merge -> verificar las
// versiones publicadas en npm. Es la versión scripteada de lo que se hizo a
// mano: mismos comandos `git`/`gh`, mismo orden, mismos checks.
//
// Sin pausa de confirmación a mitad de camino: invocar este script (o el
// skill que lo dispara) YA es el pedido explícito que pide CLAUDE.md antes
// de un publish — no hace falta repetirlo. Si el checkout no está limpio,
// no está en `main`, o cualquier CI/Release sale rojo, el script aborta sin
// tocar nada más (no mergea, no reintenta a ciegas).
//
// Uso:
//   node scripts/release-flow.mjs            # corre el flujo completo
//   node scripts/release-flow.mjs --dry-run   # solo lee estado, no muta nada

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const VERSION_PR_BRANCH = "changeset-release/main";
const RELEASE_WORKFLOWS = ["CI", "Release", "LindaUI Skill"];
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60_000;
const MAX_WATCH_ATTEMPTS = 3;

/** Inject process/network/clock boundaries so release failure paths are testable. */
export function createReleaseFlow({
  root = repoRoot, dryRun = false, execute = execFileSync,
  fetchRegistry = globalThis.fetch, now = Date.now, log = console.log,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  function run(cmd, args, { inherit = false } = {}) {
    return (execute(cmd, args, {
      cwd: root,
      encoding: "utf8",
      stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    }) ?? "").trim();
  }

  function runJson(cmd, args) {
    return JSON.parse(run(cmd, args));
  }

  function git(args, opts) {
    return run("git", args, opts);
  }

  function gh(args, opts) {
    return run("gh", args, opts);
  }

  /** Lee el nombre + versión de cada paquete publicable (no privado) del workspace. */
  function publishablePackages() {
    const dirs = readdirSync(resolve(root, "packages"));
    return dirs
      .map((d) => resolve(root, "packages", d, "package.json"))
      .map((p) => JSON.parse(readFileSync(p, "utf8")))
      .filter((pkg) => !pkg.private);
  }

  /** Espera hasta que aparezcan corridas de `workflowNames` para `headSha` en `branch`. */
  async function findRunsForSha(branch, event, headSha, workflowNames) {
    const deadline = now() + POLL_TIMEOUT_MS;
    while (now() < deadline) {
      const runs = runJson("gh", [
        "run", "list",
        "--branch", branch,
        "--limit", "20",
        "--json", "databaseId,name,headSha,status,conclusion,event,url",
      ]);
      const found = workflowNames
        .map((name) => runs.find((r) => r.headSha === headSha && r.event === event && r.name === name))
        .filter(Boolean);
      if (found.length === workflowNames.length) return found;
      await sleep(POLL_INTERVAL_MS);
    }
    throw new Error(
      `Timeout esperando corridas [${workflowNames.join(", ")}] para ${headSha} en ${branch}/${event}.`,
    );
  }

  /**
   * Espera a que termine una corrida. Si termina en `action_required` (flake
   * conocido en PRs abiertos por el bot de changesets), la reintenta hasta
   * `MAX_WATCH_ATTEMPTS` veces. Cualquier otra conclusión no exitosa aborta.
   */
  async function watchRunResilient(current, attempt = 1) {
    log(`  watch ${current.name} (${current.databaseId}) ${current.url}`);
    try {
      gh(["run", "watch", String(current.databaseId), "--exit-status"], { inherit: true });
      return;
    } catch {
      const fresh = runJson("gh", ["run", "view", String(current.databaseId), "--json", "conclusion"]);
      if (fresh.conclusion !== "action_required") {
        throw new Error(`${current.name} (${current.databaseId}) terminó en '${fresh.conclusion}'.`);
      }
      if (attempt === MAX_WATCH_ATTEMPTS) {
        throw new Error(`${current.name} (${current.databaseId}) sigue en action_required tras ${attempt} intentos.`);
      }
      log(`  ${current.name} cayó en action_required (flake conocido) — reintentando (${attempt}/${MAX_WATCH_ATTEMPTS - 1})`);
      gh(["run", "rerun", String(current.databaseId)]);
      await sleep(POLL_INTERVAL_MS);
      const next = runJson("gh", ["run", "view", String(current.databaseId), "--json", "databaseId,name,url"]);
      return watchRunResilient(next, attempt + 1);
    }
  }

  async function waitForPushWorkflows(branch, headSha) {
    const runs = await findRunsForSha(branch, "push", headSha, RELEASE_WORKFLOWS);
    for (const r of runs) await watchRunResilient(r);
  }

  async function reportPublishedVersions() {
    log("\nVersiones publicadas y verificadas contra el registry:");
    for (const pkg of publishablePackages()) {
      const response = await fetchRegistry(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}?release=${now()}`, {
        signal: AbortSignal.timeout(15000), headers: { "cache-control": "no-cache" },
      });
      if (!response.ok) throw new Error(`${pkg.name}: registry respondió ${response.status}.`);
      const metadata = await response.json();
      const published = metadata.versions?.[pkg.version];
      if (!published?.dist?.tarball || metadata["dist-tags"]?.latest !== pkg.version) {
        throw new Error(`${pkg.name}@${pkg.version} no está publicado como latest; no declarar éxito.`);
      }
      log(`  ✓ ${pkg.name}@${pkg.version} (${published.dist.integrity ?? published.dist.shasum})`);
    }
  }

  async function main() {
    const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
    if (branch !== "main") {
      throw new Error(`Este flujo corre desde 'main', estás en '${branch}'.`);
    }
    // Solo tracked changes bloquean el flujo — untracked cruft (ej. caches de
    // tooling) no es señal de trabajo sin commitear.
    if (git(["status", "--porcelain", "--untracked-files=no"])) {
      throw new Error("Hay cambios sin commitear en archivos trackeados — commiteá o descartá antes de correr el flujo.");
    }

    git(["fetch", "origin", "main", "--quiet"]);
    const ahead = Number(git(["rev-list", "--count", "origin/main..main"]));
    const behind = Number(git(["rev-list", "--count", "main..origin/main"]));
    if (behind > 0) {
      throw new Error(`Local main está ${behind} commit(s) atrás de origin/main — hacé pull primero.`);
    }

    const existingPr = runJson("gh", [
      "pr", "list", "--head", VERSION_PR_BRANCH, "--state", "open",
      "--json", "number,headRefOid,url",
    ])[0];

    if (ahead === 0 && !existingPr) {
      log("Nada para pushear y no hay Version PR abierto — no hay nada que hacer.");
      return;
    }

    if (dryRun) {
      log(`[dry-run] ahead=${ahead} behind=${behind}`);
      if (ahead > 0) log("[dry-run] correría: git push");
      if (existingPr) {
        log(`[dry-run] Version PR abierto: #${existingPr.number} (${existingPr.url}) — correría watch+merge`);
      } else {
        log("[dry-run] esperaría CI+Release de push; si aparece Version PR, seguiría con watch+merge");
      }
      log("[dry-run] no se ejecutó ninguna acción que mute estado.");
      return;
    }

    if (ahead > 0) {
      log(`Pusheando ${ahead} commit(s)...`);
      git(["push"], { inherit: true });
      const headSha = git(["rev-parse", "HEAD"]);
      log(`Esperando CI + Release para ${headSha}...`);
      await waitForPushWorkflows("main", headSha);
    }

    let pr = existingPr ?? runJson("gh", [
      "pr", "list", "--head", VERSION_PR_BRANCH, "--state", "open",
      "--json", "number,headRefOid,url",
    ])[0];

    if (!pr) {
      log("Sin Version PR pendiente — Release ya publicó directo (o no había changesets).");
      await reportPublishedVersions();
      return;
    }

    log(`Version PR abierto: #${pr.number} (${pr.url})`);
    log(gh(["pr", "diff", String(pr.number)]).split("\n").filter((l) => l.includes('"version"')).join("\n"));

    log("Esperando CI del Version PR...");
    const prRuns = await findRunsForSha(VERSION_PR_BRANCH, "pull_request", pr.headRefOid, ["CI", "LindaUI Skill"]);
    for (const prRun of prRuns) await watchRunResilient(prRun);

    log(`Mergeando #${pr.number}...`);
    gh(["pr", "merge", String(pr.number), "--squash", "--delete-branch"], { inherit: true });

    git(["fetch", "origin", "main", "--quiet"]);
    const mergeSha = git(["rev-parse", "origin/main"]);
    log(`Esperando CI + Release post-merge para ${mergeSha}...`);
    await waitForPushWorkflows("main", mergeSha);

    git(["pull", "--quiet"]);
    await reportPublishedVersions();
  }
  return { main, run, findRunsForSha, watchRunResilient, reportPublishedVersions, sleep };
}

export async function releaseCLI(args, options = {}) {
  for (const arg of args) {
    if (!["--dry-run", "--help"].includes(arg)) throw new Error(`Unknown release option: ${arg}`);
  }
  if (args.includes("--help")) {
    console.log("Usage: node scripts/release-flow.mjs [--dry-run] [--help]");
    return;
  }
  await createReleaseFlow({ ...options, dryRun: args.includes("--dry-run") }).main();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  releaseCLI(process.argv.slice(2)).catch((err) => {
    console.error(`\n✗ ${err.message}`);
    process.exitCode = 1;
  });
}
