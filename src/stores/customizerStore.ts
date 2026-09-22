"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type DesignElementType = "image" | "text";

export interface ImageElement {
  id: string;
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
}

export interface TextElement {
  id: string;
  type: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  fill: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  textAlign: "left" | "center" | "right";
  letterSpacing: number;
  opacity: number;
  locked: boolean;
}

export type DesignElement = ImageElement | TextElement;

export type Side = "front" | "back";

interface DesignState {
  elements: DesignElement[];
}

interface HistoryEntry {
  front: DesignState;
  back: DesignState;
}

interface CustomizerStore {
  // Product config
  productId: string;
  selectedColorId: string;
  selectedColorHex: string;
  selectedSizeId: string;

  // Design state
  currentSide: Side;
  front: DesignState;
  back: DesignState;

  // Selected element
  selectedElementId: string | null;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Texture refresh trigger
  textureVersion: number;

  // Actions
  setProductConfig: (productId: string, colorId: string, colorHex: string, sizeId: string) => void;
  setColor: (colorId: string, colorHex: string) => void;
  setSize: (sizeId: string) => void;
  setSide: (side: Side) => void;
  selectElement: (id: string | null) => void;

  // Element manipulation
  addImageElement: (src: string) => void;
  addTextElement: () => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;
  resetDesign: () => void;

  // Texture
  triggerTextureUpdate: () => void;
  getDesignElements: (side: Side) => DesignElement[];
}

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1024;

export const useCustomizerStore = create<CustomizerStore>((set, get) => ({
  productId: "",
  selectedColorId: "",
  selectedColorHex: "#0A0A0A",
  selectedSizeId: "",
  currentSide: "front",
  front: { elements: [] },
  back: { elements: [] },
  selectedElementId: null,
  history: [],
  historyIndex: -1,
  textureVersion: 0,

  setProductConfig: (productId, colorId, colorHex, sizeId) =>
    set({ productId, selectedColorId: colorId, selectedColorHex: colorHex, selectedSizeId: sizeId }),

  setColor: (colorId, colorHex) =>
    set({ selectedColorId: colorId, selectedColorHex: colorHex }),

  setSize: (sizeId) => set({ selectedSizeId: sizeId }),

  setSide: (side) => set({ currentSide: side, selectedElementId: null }),

  selectElement: (id) => set({ selectedElementId: id }),

  getDesignElements: (side) => {
    const state = get();
    return side === "front" ? state.front.elements : state.back.elements;
  },

  addImageElement: (src) => {
    const { currentSide } = get();
    get().pushHistory();
    const el: ImageElement = {
      id: uuidv4(),
      type: "image",
      src,
      x: CANVAS_WIDTH / 2 - 150,
      y: CANVAS_HEIGHT / 2 - 150,
      width: 300,
      height: 300,
      rotation: 0,
      opacity: 1,
      locked: false,
    };
    set((s) => ({
      [currentSide]: { elements: [...s[currentSide].elements, el] },
      selectedElementId: el.id,
    }));
    get().triggerTextureUpdate();
  },

  addTextElement: () => {
    const { currentSide } = get();
    get().pushHistory();
    const el: TextElement = {
      id: uuidv4(),
      type: "text",
      content: "YOUR TEXT",
      fontFamily: "Inter",
      fontSize: 72,
      fontWeight: "700",
      fontStyle: "normal",
      fill: "#FFFFFF",
      x: CANVAS_WIDTH / 2 - 150,
      y: CANVAS_HEIGHT / 2 - 50,
      width: 300,
      height: 100,
      rotation: 0,
      textAlign: "center",
      letterSpacing: 4,
      opacity: 1,
      locked: false,
    };
    set((s) => ({
      [currentSide]: { elements: [...s[currentSide].elements, el] },
      selectedElementId: el.id,
    }));
    get().triggerTextureUpdate();
  },

  updateElement: (id, updates) => {
    const { currentSide } = get();
    set((s) => ({
      [currentSide]: {
        elements: s[currentSide].elements.map((el) =>
          el.id === id ? ({ ...el, ...updates } as DesignElement) : el
        ),
      },
    }));
    get().triggerTextureUpdate();
  },

  deleteElement: (id) => {
    const { currentSide } = get();
    get().pushHistory();
    set((s) => ({
      [currentSide]: {
        elements: s[currentSide].elements.filter((el) => el.id !== id),
      },
      selectedElementId: null,
    }));
    get().triggerTextureUpdate();
  },

  duplicateElement: (id) => {
    const { currentSide } = get();
    get().pushHistory();
    set((s) => {
      const el = s[currentSide].elements.find((e) => e.id === id);
      if (!el) return {};
      const duplicate = { ...el, id: uuidv4(), x: el.x + 20, y: el.y + 20 };
      return {
        [currentSide]: {
          elements: [...s[currentSide].elements, duplicate],
        },
        selectedElementId: duplicate.id,
      };
    });
    get().triggerTextureUpdate();
  },

  bringForward: (id) => {
    const { currentSide } = get();
    set((s) => {
      const elements = [...s[currentSide].elements];
      const idx = elements.findIndex((e) => e.id === id);
      if (idx < elements.length - 1) {
        [elements[idx], elements[idx + 1]] = [elements[idx + 1], elements[idx]];
      }
      return { [currentSide]: { elements } };
    });
    get().triggerTextureUpdate();
  },

  sendBackward: (id) => {
    const { currentSide } = get();
    set((s) => {
      const elements = [...s[currentSide].elements];
      const idx = elements.findIndex((e) => e.id === id);
      if (idx > 0) {
        [elements[idx], elements[idx - 1]] = [elements[idx - 1], elements[idx]];
      }
      return { [currentSide]: { elements } };
    });
    get().triggerTextureUpdate();
  },

  pushHistory: () => {
    const { front, back, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      front: { elements: [...front.elements] },
      back: { elements: [...back.elements] },
    });
    set({ history: newHistory.slice(-20), historyIndex: newHistory.slice(-20).length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const entry = history[historyIndex - 1];
    set({ front: entry.front, back: entry.back, historyIndex: historyIndex - 1 });
    get().triggerTextureUpdate();
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    set({ front: entry.front, back: entry.back, historyIndex: historyIndex + 1 });
    get().triggerTextureUpdate();
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  resetDesign: () => {
    get().pushHistory();
    set({ front: { elements: [] }, back: { elements: [] }, selectedElementId: null });
    get().triggerTextureUpdate();
  },

  triggerTextureUpdate: () =>
    set((s) => ({ textureVersion: s.textureVersion + 1 })),
}));
