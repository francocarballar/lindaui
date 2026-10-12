"use client";

import {
  Avatar, Description, Header, InputGroup, Kbd, Label, ListBox,
  Modal, ScrollShadow, Separator, TextField,
} from "@lindaui/ui/compound";
import { Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface CommandPaletteItem {
  description?: string;
  identifier: string;
  name: string;
}

export interface CommandPaletteProps<T extends CommandPaletteItem = CommandPaletteItem> {
  isOpen: boolean;
  items: T[];
  onClose: () => void;
  onSelect: (item: T) => void;
  placeholder?: string;
  recentIds?: string[];
  title?: string;
  recentLabel?: string;
  allItemsLabel?: string;
  renderEmptyState?: (query: string) => ReactNode;
  renderAvatar?: (item: T) => ReactNode;
}

/** Search names and descriptions, keeping recent items first in their original collection order. */
export function CommandPalette<T extends CommandPaletteItem>({
  isOpen, onClose, items, onSelect, placeholder = "Search…", title = "Search",
  recentIds = [], recentLabel = "Recent", allItemsLabel = "All items",
  renderEmptyState, renderAvatar,
}: CommandPaletteProps<T>) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const search = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(search)
      || item.description?.toLowerCase().includes(search));
  }, [items, query]);
  const recents = filtered.filter((item) => recentIds.includes(item.identifier));
  const rest = filtered.filter((item) => !recentIds.includes(item.identifier));

  const handleClose = useCallback(() => {
    onClose();
    setQuery("");
  }, [onClose]);
  const handleSelect = useCallback((key: string | number) => {
    const item = items.find((candidate) => candidate.identifier === String(key));
    if (item) {
      onSelect(item);
      setQuery("");
    }
  }, [items, onSelect]);
  const renderItem = (item: T) => (
    <ListBox.Item id={item.identifier} key={item.identifier} textValue={item.name}>
      <Avatar size="sm">
        {renderAvatar ? renderAvatar(item) : (
          <Avatar.Fallback>{item.name.charAt(0).toUpperCase()}</Avatar.Fallback>
        )}
      </Avatar>
      <Label>{item.name}</Label>
      {item.description ? <Description>{item.description}</Description> : null}
    </ListBox.Item>
  );

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }} variant="blur">
      <Modal.Container placement="top" size="lg">
        <Modal.Dialog aria-label={title}>
          <Modal.Body className="gap-0 p-0">
            <TextField aria-label={title} value={query}>
              <InputGroup className="rounded-none rounded-t-xl border-b shadow-none">
                <InputGroup.Prefix><Search className="text-muted" size={18} /></InputGroup.Prefix>
                <InputGroup.Input autoFocus onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} value={query} />
                <InputGroup.Suffix>
                  <Kbd><Kbd.Abbr keyValue="escape" /><Kbd.Content>ESC</Kbd.Content></Kbd>
                </InputGroup.Suffix>
              </InputGroup>
            </TextField>
            <ScrollShadow className="max-h-[360px]">
              <ListBox
                aria-label={title}
                onAction={handleSelect}
                renderEmptyState={() => renderEmptyState ? renderEmptyState(query) : (
                  <p className="py-6 text-center text-muted text-sm">No results for &ldquo;{query}&rdquo;</p>
                )}
              >
                {recents.length > 0 ? (
                  <ListBox.Section>
                    <Header>{recentLabel}</Header>
                    {recents.map(renderItem)}
                    <Separator />
                  </ListBox.Section>
                ) : null}
                <ListBox.Section>
                  {recents.length > 0 ? <Header>{allItemsLabel}</Header> : null}
                  {rest.map(renderItem)}
                </ListBox.Section>
              </ListBox>
            </ScrollShadow>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
