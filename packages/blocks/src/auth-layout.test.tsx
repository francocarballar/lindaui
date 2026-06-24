import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { AuthLayout } from "./auth-layout";

describe("AuthLayout", () => {
  test("renderiza título, descripción y el form (children)", () => {
    render(
      <AuthLayout title="Iniciar sesión" description="Accedé con tu usuario">
        <button type="button">Ingresar</button>
      </AuthLayout>
    );
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByText("Accedé con tu usuario")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  test("renderiza el panel de marca cuando hay headline/features/footer", () => {
    render(
      <AuthLayout
        title="Iniciar sesión"
        brandHeadline="Del dictado al informe firmado"
        brandFeatures={[{ label: "Dictado por voz" }, { label: "Firma trazable" }]}
        brandFooter="entorno de demostración"
      >
        <span>form</span>
      </AuthLayout>
    );
    expect(
      screen.getByRole("heading", { name: "Del dictado al informe firmado" })
    ).toBeInTheDocument();
    expect(screen.getByText("Dictado por voz")).toBeInTheDocument();
    expect(screen.getByText("entorno de demostración")).toBeInTheDocument();
  });

  test("renderiza el footer del panel de contenido", () => {
    render(
      <AuthLayout title="Login" footer={<span>Sesión protegida</span>}>
        <span>form</span>
      </AuthLayout>
    );
    expect(screen.getByText("Sesión protegida")).toBeInTheDocument();
  });
});
