import { Cliente } from "./cliente";
import { Compania } from "./compania";
import { Ramo } from "./ramo";

export interface NavigationContext {
  cliente?: Cliente;
  compania?: Compania;
  ramo?: Ramo;
  returnUrl?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}