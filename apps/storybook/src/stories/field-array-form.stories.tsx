import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldArrayForm } from "@ts/blocks/field-array-form";

const meta: Meta<typeof FieldArrayForm> = {
  title: "Blocks/FieldArrayForm",
  component: FieldArrayForm,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof FieldArrayForm>;

const STUDY_OPTIONS = [
  { value: "rmn", label: "Resonancia Magnética (RMN)" },
  { value: "tc", label: "Tomografía Computada (TC)" },
  { value: "rx", label: "Radiografía (RX)" },
  { value: "eco", label: "Ecografía" },
  { value: "densito", label: "Densitometría Ósea" },
];

export const Default: Story = {
  render: () => (
    <div className="w-[480px] p-6 border border-border rounded-xl bg-card">
      <FieldArrayForm
        options={STUDY_OPTIONS}
        onSubmit={(values) => console.log("submit", values)}
        categoryLabel="Modalidad"
        nameLabel="Nombre del estudio"
        namePlaceholder="Ej. RMN Rodilla Derecha con contraste"
        entriesLabel="Parámetros técnicos"
        addLabel="Agregar parámetro"
        keyPlaceholder="Campo"
        valuePlaceholder="Valor"
        emptyHint="No hay parámetros agregados todavía."
        submitLabel="Crear plantilla"
      />
    </div>
  ),
};

export const WithDefaultValues: Story = {
  render: () => (
    <div className="w-[480px] p-6 border border-border rounded-xl bg-card">
      <FieldArrayForm
        options={STUDY_OPTIONS}
        onSubmit={(values) => console.log("submit", values)}
        categoryLabel="Modalidad"
        nameLabel="Nombre del estudio"
        entriesLabel="Parámetros técnicos"
        submitLabel="Actualizar plantilla"
        defaultValues={{
          category: "rmn",
          name: "RMN Rodilla Derecha con gadolinio",
          entries: [
            { key: "Tesla", value: "1.5T" },
            { key: "Secuencias", value: "T1, T2, FLAIR, DWI" },
            { key: "Contraste", value: "Gadolinio 0.1 mmol/kg" },
            { key: "Posición", value: "Decúbito dorsal" },
          ],
        }}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="w-[480px] p-6 border border-border rounded-xl bg-card">
      <FieldArrayForm
        options={STUDY_OPTIONS}
        onSubmit={async () => { await new Promise((r) => setTimeout(r, 2000)); }}
        categoryLabel="Modalidad"
        nameLabel="Nombre del estudio"
        entriesLabel="Parámetros"
        submitLabel="Guardando…"
        loading
        defaultValues={{
          category: "tc",
          name: "TC Abdomen con contraste",
          entries: [{ key: "Cortes", value: "5mm" }],
        }}
      />
    </div>
  ),
};
