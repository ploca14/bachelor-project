import type { Directive } from "vue";

export const vAutoFocus: Directive = {
  mounted(el) {
    el.querySelector("input").focus();
  },
};
