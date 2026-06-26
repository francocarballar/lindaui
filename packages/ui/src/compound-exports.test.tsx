import { describe, test, expect } from "vitest";
import { Accordion } from "./accordion";
import { Breadcrumbs } from "./breadcrumbs";
import { Card } from "./card";
import { Disclosure } from "./disclosure";
import { DisclosureGroup } from "./disclosure-group";
import { Divider } from "./divider";
import { Drawer } from "./drawer";
import { Kbd } from "./kbd";
import { Link } from "./link";
import { ListBox } from "./listbox";
import { Meter } from "./meter";
import { Pagination } from "./pagination";
import { Popover } from "./popover";
import { Progress } from "./progress";
import { ProgressCircle } from "./progress-circle";
import { ScrollShadow } from "./scroll-shadow";
import { Surface } from "./surface";
import { Tag } from "./tag";
import { TagGroup } from "./tag-group";
import { Text } from "./text";
import { toast, ToastProvider } from "./toast";
import { Tooltip } from "./tooltip";

// These HeroUI v3 components are compound RAC compositions (Root/Content/...)
// that need sub-component assembly to render meaningfully; the wrappers
// re-export them, so we assert the public surface resolves rather than
// rendering a half-composition. Same approach as date-time-color.test.tsx.
describe("Compound re-export surface", () => {
  test.each([
    ["Accordion", Accordion],
    ["Breadcrumbs", Breadcrumbs],
    ["Card", Card],
    ["Disclosure", Disclosure],
    ["DisclosureGroup", DisclosureGroup],
    ["Divider", Divider],
    ["Drawer", Drawer],
    ["Kbd", Kbd],
    ["Link", Link],
    ["ListBox", ListBox],
    ["Meter", Meter],
    ["Pagination", Pagination],
    ["Popover", Popover],
    ["Progress", Progress],
    ["ProgressCircle", ProgressCircle],
    ["ScrollShadow", ScrollShadow],
    ["Surface", Surface],
    ["Tag", Tag],
    ["TagGroup", TagGroup],
    ["Text", Text],
    ["toast", toast],
    ["ToastProvider", ToastProvider],
    ["Tooltip", Tooltip],
  ])("%s is exported", (_name, exported) => {
    expect(exported).toBeDefined();
  });
});
