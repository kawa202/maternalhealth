// components/ui/select.tsx
import * as React from "react";
import {
  Select as SelectPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
  SelectContent as SelectContentPrimitive,
  SelectItem as SelectItemPrimitive,
} from "@radix-ui/react-select";

export const Select = SelectPrimitive.Root;
export const SelectTrigger = SelectTriggerPrimitive;
export const SelectValue = SelectValuePrimitive;
export const SelectContent = SelectContentPrimitive;
export const SelectItem = SelectItemPrimitive;
