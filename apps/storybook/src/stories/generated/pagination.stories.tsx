import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/pagination";
import { useState } from "react";
function PaginationDemo() { const [page, setPage] = useState(1); return <M.Pagination aria-label="Páginas"><M.Pagination.Content><M.Pagination.Item><M.Pagination.Previous isDisabled={page === 1} onPress={() => setPage(page - 1)}>Anterior</M.Pagination.Previous></M.Pagination.Item>{[1, 2, 3].map(value => <M.Pagination.Item key={value}><M.Pagination.Link isActive={page === value} onPress={() => setPage(value)}>{value}</M.Pagination.Link></M.Pagination.Item>)}<M.Pagination.Item><M.Pagination.Next isDisabled={page === 3} onPress={() => setPage(page + 1)}>Siguiente</M.Pagination.Next></M.Pagination.Item></M.Pagination.Content><M.Pagination.Summary><output role="status">Página {page} de 3</output></M.Pagination.Summary></M.Pagination>; }

const meta: Meta = { title: "Components/Pagination" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<PaginationDemo />) };
