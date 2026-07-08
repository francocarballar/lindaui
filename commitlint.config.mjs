export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Los subjects del repo llevan contexto largo; el límite de 100 default corta legítimos.
    "header-max-length": [0],
  },
};
