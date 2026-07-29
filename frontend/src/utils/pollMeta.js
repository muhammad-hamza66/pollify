import { CheckCircle2, ToggleLeft, Star, Image, MessageSquare } from "lucide-react";

// Poll `type` is a fixed backend enum: single | yesno | rating | image | open.
// Centralizing the label/icon mapping here so every page describes types identically.
export const POLL_TYPES = [
  { value: "single", label: "Single Choice", description: "Pick one option from a list you write", icon: CheckCircle2 },
  { value: "yesno", label: "Yes / No", description: "A simple two-option vote", icon: ToggleLeft },
  { value: "rating", label: "Star Rating", description: "Voters rate 1 to 5 stars", icon: Star },
  { value: "image", label: "Image Poll", description: "Voters pick between 2-4 images", icon: Image },
  { value: "open", label: "Open Question", description: "Voters submit free-text answers", icon: MessageSquare },
];

export const pollTypeMeta = (type) => POLL_TYPES.find((t) => t.value === type) || POLL_TYPES[0];
