import * as React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Table from "../Table";

test("Only 15 rows should have been rendered", async () => {
  render(<Table buffer={5} limit={10} />);

  //data-table-row
  expect(screen.getByTestId("table-row-0")).toBeInTheDocument();
  expect(document.querySelectorAll(".table-row").length).toBe(15);
});

test("Only 20 rows should have been rendered", async () => {
  render(<Table buffer={5} limit={10} />);

  //data-table-row
  // document.querySelector("tbody").scrollTop = 1000;

  fireEvent.scroll(document.querySelector("tbody"), {
    target: { scrollY: 1000 }
  });

  await screen.getByTestId("table-row-14");
  console.log(22, document.querySelectorAll(".table-row").length);
});
