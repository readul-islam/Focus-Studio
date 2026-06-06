type CanvasElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  props?: {
    text?: string;
    fontSize?: number;
    fill?: string;
    src?: string;
    shapeType?: string;
    fill_color?: string;
  };
};

type Slide = {
  background_color?: string;
  canvas_data?: CanvasElement[];
  pins?: { x: number; y: number; label?: string; product_name?: string }[];
};

const SLIDE_W = 1280;
const SLIDE_H = 720;

export function PresentationSlideView({ slide }: { slide: Slide }) {
  const elements = [...(slide.canvas_data || [])].sort((a, b) => a.z - b.z);

  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-sm"
      style={{ backgroundColor: slide.background_color || '#FFFFFF' }}
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{ transform: 'scale(var(--slide-scale, 1))' }}
      >
        <div className="relative" style={{ width: SLIDE_W, height: SLIDE_H }}>
          {elements.map((el) => {
            if (el.type === 'text') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.w,
                    fontSize: el.props?.fontSize || 24,
                    color: el.props?.fill || '#111',
                  }}
                >
                  {el.props?.text}
                </div>
              );
            }
            if (el.type === 'image' || el.type === 'pdf') {
              return el.props?.src ? (
                <img
                  key={el.id}
                  src={el.props.src}
                  alt=""
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.w,
                    height: el.h,
                    objectFit: 'cover',
                  }}
                />
              ) : null;
            }
            if (el.type === 'shape') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.w,
                    height: el.h,
                    backgroundColor: el.props?.fill || '#e5e7eb',
                    borderRadius: el.props?.shapeType === 'circle' ? '50%' : 0,
                  }}
                />
              );
            }
            return null;
          })}
          {(slide.pins || []).map((pin, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-orange-600 border-2 border-white"
              style={{ left: pin.x - 8, top: pin.y - 8 }}
              title={pin.label || pin.product_name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
