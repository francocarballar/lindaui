import { describe, test, expect } from "vitest";
import { normalizeText, matchesSearch } from "./search";

describe("normalizeText", () => {
  test("baja a minúsculas y recorta", () => {
    expect(normalizeText("  HOLA  ")).toBe("hola");
  });

  test("quita acentos y diacríticos", () => {
    expect(normalizeText("José")).toBe("jose");
    expect(normalizeText("GARCÍA PÉREZ")).toBe("garcia perez");
    expect(normalizeText("Müller")).toBe("muller");
  });
});

describe("matchesSearch", () => {
  test("query vacío matchea todo", () => {
    expect(matchesSearch("cualquier cosa", "")).toBe(true);
    expect(matchesSearch("cualquier cosa", "   ")).toBe(true);
  });

  test("es resiliente a mayúsculas y acentos en ambos lados", () => {
    expect(matchesSearch("García Pérez, María", "maria")).toBe(true);
    expect(matchesSearch("García Pérez, María", "PÉREZ")).toBe(true);
    expect(matchesSearch("José Ramírez", "jose ramirez")).toBe(true);
  });

  test("no matchea cuando el término no está", () => {
    expect(matchesSearch("García Pérez", "lopez")).toBe(false);
  });
});
