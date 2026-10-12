import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/table-pane";
import { useState } from "react";
function TablePaneDemo() { const [search, setSearch] = useState(""); const rows = [{name: "Ada Lovelace", status: "Confirmado"}, {name: "Grace Hopper", status: "Pendiente"}]; const filtered = rows.filter(row => row.name.toLowerCase().includes(search.toLowerCase())); return <M.TablePane columns={[{key: "name", label: "Nombre"}, {key: "status", label: "Estado"}]} rows={filtered} ariaLabel="Turnos" searchValue={search} onSearchChange={setSearch} footerCount={{shown: filtered.length, total: rows.length}} />; }

const meta: Meta = { title: "Components/TablePane" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<TablePaneDemo />) };
