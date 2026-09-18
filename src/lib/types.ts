export type IconName =
  | "shield"
  | "heart"
  | "puzzle"
  | "pulse"
  | "brain"
  | "handshake"
  | "sprout"
  | "laptop"
  | "eye"
  | "home"
  | "pause"
  | "repeat"
  | "warning"
  | "bathtub"
  | "basket"
  | "target"
  | "doc"
  | "play"
  | "bulb"
  | "checkcirc"
  | "traffic";

export type Module = {
  id: string;
  title: string;
  badge: string;
  desc: string;
  tags: string[];
  priority: boolean;
  icon: IconName;
  age: string[];
  gender: string[];
  order: number;
  coverImage?: string;
};

export type PieceKind = "articulo" | "video" | "tip" | "checklist" | "semaforo";

export type RenderType =
  | "text"
  | "checklist"
  | "semaforo"
  | "signals"
  | "actionLists"
  | "video";

export type SemaforoPanel = {
  label: string;
  title: string;
  text: string;
  items: string[];
};

export type SignalsGroup = {
  label: string;
  tags: string[];
};

export type ActionListColumn = {
  title: string;
  items: string[];
};

export type Piece = {
  id: string;
  moduleId: string;
  kind: PieceKind;
  renderType: RenderType;
  age: string[];
  gender: string[];
  title: string;
  summary: string;
  order: number;
  icon?: IconName;

  // renderType: 'text'
  text?: string;
  tip?: string;

  // renderType: 'checklist'
  items?: string[];

  // renderType: 'semaforo'
  rojo?: SemaforoPanel;
  amarillo?: SemaforoPanel;
  verde?: SemaforoPanel;

  // renderType: 'signals'
  groupA?: SignalsGroup;
  groupB?: SignalsGroup;

  // renderType: 'actionLists'
  colA?: ActionListColumn;
  colB?: ActionListColumn;

  // renderType: 'video'
  videoTitle?: string;
  channel?: string;
  videoUrl?: string;
};
