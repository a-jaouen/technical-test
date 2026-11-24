import { TypeName } from "../types/pokemon";

/**
 * Turn a slug into a readable label: "mr-mime" -> "Mr Mime"
 * @param slug - Words separated by dashes
 */
export const label = (slug: string): string =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const TYPE_COLORS: Record<TypeName, string> = {
  [TypeName.Normal]: "#9099a1",
  [TypeName.Fire]: "#e8743b",
  [TypeName.Water]: "#4d90d5",
  [TypeName.Electric]: "#d9a800",
  [TypeName.Grass]: "#4fa64a",
  [TypeName.Ice]: "#4fb3aa",
  [TypeName.Fighting]: "#ce4069",
  [TypeName.Poison]: "#ab6ac8",
  [TypeName.Ground]: "#c2703f",
  [TypeName.Flying]: "#6f8fd3",
  [TypeName.Psychic]: "#e8626b",
  [TypeName.Bug]: "#7f9c1f",
  [TypeName.Rock]: "#a8986a",
  [TypeName.Ghost]: "#5269ac",
  [TypeName.Dragon]: "#0a6dc4",
  [TypeName.Dark]: "#5a5366",
  [TypeName.Steel]: "#5a8ea1",
  [TypeName.Fairy]: "#d86fc4",
};

export const TYPES = Object.values(TypeName);
