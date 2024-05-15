<template>
  <ul
    :aria-multiselectable="selectionMode === 'multiple'"
    role="listbox"
    tabindex="-1"
  >
    <li
      v-for="{ item, active, selected, id } in itemsState"
      :key="item.id"
      role="option"
      :aria-selected="selected"
      :tabindex="active ? 0 : -1"
      @click="handleClick($event, id)"
      @keyup.space="handleClick($event, id)"
      @keydown.enter="handleClick($event, id)"
      @keydown.right="handleKeyEvent($event, id, getNextId(id))"
      @keydown.left="handleKeyEvent($event, id, getPreviousId(id))"
      @keydown.down="handleKeyEvent($event, id, getBelowId(id))"
      @keydown.up="handleKeyEvent($event, id, getAboveId(id))"
      @keydown.ctrl.a.prevent="handleCtrlA"
      class="group cursor-pointer select-none outline-none"
      v-focus="active"
    >
      <slot v-bind="{ item, active, selected }" />
    </li>
  </ul>
</template>

<script setup lang="ts" generic="T extends { id: any }">
import type { Directive } from "vue";

type MaybeGetter<T> = T | (() => T);

const props = withDefaults(
  defineProps<{
    items: T[];
    columnCount: MaybeGetter<number>;
    selectionMode?: "multiple" | "single";
  }>(),
  {
    selectionMode: "single",
  },
);

const [selectedIds] = defineModel<number[]>({
  default: () => [],
  set: (value) => {
    const deduped = Array.from(new Set(value));

    return deduped;
  },
});

const activeId = ref<number>(0);

const vFocus: Directive = {
  updated: (el, binding) => {
    if (binding.value) el.focus();
  },
};

const itemsState = computed(() => {
  return props.items.map((item, id) => ({
    item,
    id,
    selected: selectedIds.value.includes(id),
    active: activeId.value === id,
  }));
});

const handleClick = (event: unknown, newId: number) => {
  if (!(event instanceof PointerEvent || event instanceof KeyboardEvent))
    return;

  activeId.value = newId;

  // If the selection mode is "single"
  if (props.selectionMode === "single") {
    // If the file is already selected, deselect it, otherwise, select it.
    selectedIds.value = selectedIds.value.includes(newId) ? [] : [newId];
    return;
  }

  // If the user is holding the shift key.
  if (event.shiftKey) {
    // Select all files between the last selected file and the current file.
    const lastSelectedId = selectedIds.value[selectedIds.value.length - 1];
    const [start, end] = [lastSelectedId, newId].sort((a, b) => a - b);
    const newSelection = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    );

    return (selectedIds.value = [
      ...selectedIds.value,
      ...newSelection.filter((id) => !selectedIds.value.includes(id)),
    ]);
  }

  // If the user is not holding any modifier keys,
  // If the file is already selected, deselect it, otherwise, select it.
  return (selectedIds.value = selectedIds.value.includes(newId)
    ? selectedIds.value.filter((selectedId) => selectedId !== newId)
    : [...selectedIds.value, newId]);
};

const handleKeyEvent = (event: unknown, id: number, newId: number) => {
  if (!(event instanceof KeyboardEvent)) return;

  // Move the focus to the new file.
  activeId.value = newId;

  // If the user is holding the shift key.
  if (event.shiftKey) {
    if (props.selectionMode === "single") return;

    // Selects all files between the last selected file and the current file.
    const [start, end] = [id, newId].sort((a, b) => a - b);
    const newSelection = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    );

    if (
      selectedIds.value.length >= newSelection.length &&
      newSelection.every((id) => selectedIds.value.includes(id))
    ) {
      return (selectedIds.value = [
        ...selectedIds.value.filter(
          (selectedId) => !newSelection.includes(selectedId),
        ),
        newId,
      ]);
    }

    return (selectedIds.value = [
      ...selectedIds.value,
      ...newSelection.filter((id) => !selectedIds.value.includes(id)),
    ]);
  }
};

const handleCtrlA = () => {
  if (props.selectionMode === "single") return;

  selectedIds.value = Array.from({ length: props.items.length }, (_, i) => i);
};

const getNextId = (id: number) => {
  // If the current file is the last file,
  // Return the current file.
  if (id === props.items.length - 1) return id;

  // Otherwise, return the next file.
  return id + 1;
};
const getPreviousId = (id: number) => {
  // If the current file is the first file,
  // Return the current file.
  if (id === 0) return id;

  // Otherwise, return the previous file.
  return id - 1;
};
const getBelowId = (id: number) => {
  // If the current file is in the last row,
  // Return the current file.
  if (id + toValue(props.columnCount) >= props.items.length) return id;

  // Otherwise, return the file below.
  return id + toValue(props.columnCount);
};
const getAboveId = (id: number) => {
  // If the current file is in the first row,
  // Return the current file.
  if (id - toValue(props.columnCount) < 0) return id;

  // Otherwise, return the file above.
  return id - toValue(props.columnCount);
};
</script>
