import { render, screen } from "@testing-library/react";
import { Tabs, TabList, Tab, TabPanel } from "./tabs";
import { describe, test, expect } from "vitest";

describe("Tabs", () => {
  test("renders tab labels", () => {
    render(
      <Tabs>
        <TabList aria-label="Ejemplo">
          <Tab id="a">Tab A</Tab>
          <Tab id="b">Tab B</Tab>
        </TabList>
        <TabPanel id="a">Contenido A</TabPanel>
        <TabPanel id="b">Contenido B</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument();
  });
});
