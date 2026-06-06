export type CanvasElementType = 'text' | 'image' | 'shape' | 'pdf';

export type CanvasElement = {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  locked?: boolean;
  props: {
    text?: string;
    fontSize?: number;
    fill?: string;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    align?: 'left' | 'center' | 'right';
    src?: string;
    shapeType?: 'rect' | 'circle';
    stroke?: string;
    strokeWidth?: number;
    name?: string;
  };
};

export type PresentationSlide = {
  id: number;
  presentation: number;
  order: number;
  title: string;
  background_color: string;
  background_image: string | null;
  background_src?: string;
  background_image_url: string | null;
  canvas_data: CanvasElement[];
  pins?: PresentationPin[];
  comments?: PresentationComment[];
  created_at: string;
  updated_at: string;
};

export type PresentationPin = {
  id: number;
  slide: number;
  slide_id?: number;
  presentation_id?: number;
  pin_type: 'product' | 'scene';
  product: number | null;
  design_asset: number | null;
  x: number;
  y: number;
  label: string;
  show_pricing: boolean;
  product_name?: string | null;
  product_image_url?: string | null;
  product_price?: number | null;
  scene_image_url?: string | null;
  created_at: string;
};

export type PresentationComment = {
  id: number;
  slide: number;
  x: number;
  y: number;
  text: string;
  author_type: 'studio' | 'client';
  author_name: string;
  created_at: string;
};

export type Presentation = {
  id: number;
  title: string;
  project: number;
  project_name: string;
  thumbnail_url: string | null;
  slide_count: number;
  pin_count: number;
  client_dashboard_published: boolean;
  web_published: boolean;
  public_token: string;
  show_product_pricing: boolean;
  show_supplier_info: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  slides?: PresentationSlide[];
};

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;
