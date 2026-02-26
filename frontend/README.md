# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Project-specific information

This frontend powers the **Mutual Fund Calculator** app. It communicates with the Spring Boot backend via the `/api` endpoints (a proxy is configured in `vite.config.js` to forward requests during development).

### Development

```bash
cd frontend
yarn install   # or npm install
yarn dev       # starts Vite dev server on localhost:5173 by default
```

Open your browser at `http://localhost:5173` and the form should appear. You can select a fund, enter an amount and years, then click **Calculate** to retrieve the projected value.

### Directory structure

- `src/components` – React components for the investment form and input controls
- `App.jsx` – root component containing a centered card with the input form and a simple result display
- `App.css` – minimal dark-themed styles to center the card and decorate buttons/inputs

Feel free to add charts, comparisons, history tables, tests or other UI enhancements as you iterate.
