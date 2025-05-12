import React, { useLayoutEffect, useRef } from "react";
import { VariableEntry } from "../tweakpane/types";
import { FolderApi, Pane } from "tweakpane";
import { BindingApi } from "@tweakpane/core";
import VariableEntryBundle from "../tweakpane/VariableEntryBundle";

type UseVariableFolderConfig = {
  title: string;
  variables: Record<string, VariableEntry>;
  onUpdate: (v: VariableEntry) => void;
  onRemove: (key: string) => void;
};

export default function useVariableFolder(
  ref: React.RefObject<HTMLDivElement>,
  config: UseVariableFolderConfig
) {
  const paneRef = useRef<Pane | null>(null);
  const folderRef = useRef<FolderApi | null>(null);
  const bindingsRef = useRef<Record<string, BindingApi>>({});

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const pane = new Pane({ container });
    pane.registerPlugin(VariableEntryBundle);

    const folder = pane.addFolder({ title: config.title });

    paneRef.current = pane;
    folderRef.current = folder;

    Object.keys(config.variables).forEach((k) => {
      const binding = folder.addBinding(config.variables, k, {
        view: "variable-entry",
        inject: {
          onUpdate: (v: VariableEntry) => {
            config.onUpdate(v);
          },
          onRemove: () => {
            folder.remove(binding);
            delete bindingsRef.current[k];
            delete config.variables[k];
            config.onRemove(k);
          },
        },
      });
      bindingsRef.current[k] = binding;
    });

    const addBtn = pane.addButton({ title: "Add Variable" });
    addBtn.on("click", () => {
      const key = crypto.randomUUID().slice(0, 6);
      config.variables[key] = {
        type: "string",
        value: "",
        name: key,
      };
      const binding = folder.addBinding(config.variables, key, {
        view: "variable-entry",
        inject: {
          onUpdate: (v: VariableEntry) => {
            config.onUpdate(v);
          },
          onRemove: () => {
            folder.remove(binding);
            delete bindingsRef.current[key];
            delete config.variables[key];
            config.onRemove(key);
          },
        },
      });
      bindingsRef.current[key] = binding;
    });

    return () => {
      pane.dispose();
      paneRef.current = null;
      folderRef.current = null;
      bindingsRef.current = {};
    };
  }, [ref, config]);

  return {
    pane: paneRef,
    folder: folderRef,
    bindings: bindingsRef,
  };
}
