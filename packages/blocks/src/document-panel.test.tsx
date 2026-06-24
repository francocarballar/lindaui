import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { DocumentPanel } from "./document-panel";

describe("DocumentPanel", () => {
  test("state=empty renders emptyContent", () => {
    render(
      <DocumentPanel title="My Doc" state="empty" emptyContent={<p>No hay datos</p>} />
    );
    expect(screen.getByText("No hay datos")).toBeInTheDocument();
  });

  test("state=loading renders role=status and loadingLabel", () => {
    render(<DocumentPanel title="My Doc" state="loading" loadingLabel="Cargando documento…" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Cargando documento…")).toBeInTheDocument();
  });

  test("state=loading uses default loadingLabel", () => {
    render(<DocumentPanel title="My Doc" state="loading" />);
    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });

  test("state=ready renders children and title heading", () => {
    render(
      <DocumentPanel title="Informe Final" state="ready">
        <p>Contenido del documento</p>
      </DocumentPanel>
    );
    expect(screen.getByRole("heading", { name: "Informe Final" })).toBeInTheDocument();
    expect(screen.getByText("Contenido del documento")).toBeInTheDocument();
  });

  test("state=ready renders notices before children", () => {
    render(
      <DocumentPanel
        title="Doc"
        state="ready"
        notices={<div>Aviso importante</div>}
      >
        <p>Cuerpo</p>
      </DocumentPanel>
    );
    expect(screen.getByText("Aviso importante")).toBeInTheDocument();
    expect(screen.getByText("Cuerpo")).toBeInTheDocument();
  });

  test("footer renders when passed", () => {
    render(
      <DocumentPanel title="Doc" state="ready" footer={<button>Guardar</button>}>
        <p>body</p>
      </DocumentPanel>
    );
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  test("footer does not render when not passed", () => {
    render(<DocumentPanel title="Doc" state="ready"><p>body</p></DocumentPanel>);
    expect(screen.queryByRole("button", { name: "Guardar" })).toBeNull();
  });
});
