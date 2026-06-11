"""Built-in presentation deck templates for interior design studios."""
from __future__ import annotations

import copy
import uuid
from typing import Any


SLIDE_W = 1280
SLIDE_H = 720

TEMPLATE_IDS = frozenset({
    'blank',
    'client-concept',
    'ffe-selection',
    'mood-inspiration',
    'project-kickoff',
})


def _el_id() -> str:
    return f'el-{uuid.uuid4().hex[:12]}'


def _text(
    text: str,
    *,
    x: int,
    y: int,
    w: int,
    h: int,
    font_size: int = 32,
    fill: str = '#111111',
    align: str = 'left',
    bold: bool = False,
    z: int = 0,
) -> dict[str, Any]:
    return {
        'id': _el_id(),
        'type': 'text',
        'x': x,
        'y': y,
        'w': w,
        'h': h,
        'z': z,
        'props': {
            'text': text,
            'fontSize': font_size,
            'fill': fill,
            'fontFamily': 'Inter, sans-serif',
            'align': align,
            'bold': bold,
        },
    }


def _image_frame(
    label: str,
    *,
    x: int,
    y: int,
    w: int,
    h: int,
    z: int = 0,
) -> list[dict[str, Any]]:
    return [
        {
            'id': _el_id(),
            'type': 'shape',
            'x': x,
            'y': y,
            'w': w,
            'h': h,
            'z': z,
            'props': {'shapeType': 'rect', 'fill': '#F1F5F9', 'stroke': '#CBD5E1'},
        },
        _text(
            label,
            x=x,
            y=y + h // 2 - 14,
            w=w,
            h=28,
            font_size=15,
            fill='#64748B',
            align='center',
            z=z + 1,
        ),
    ]


def _cover_slide(
    title: str,
    subtitle: str,
    *,
    bg: str = '#18181B',
    title_fill: str = '#FAFAFA',
    subtitle_fill: str = '#A1A1AA',
) -> dict[str, Any]:
    return {
        'title': 'Cover',
        'background_color': bg,
        'canvas_data': [
            _text(
                title,
                x=80,
                y=260,
                w=SLIDE_W - 160,
                h=80,
                font_size=52,
                fill=title_fill,
                align='center',
                bold=True,
            ),
            _text(
                subtitle,
                x=120,
                y=360,
                w=SLIDE_W - 240,
                h=48,
                font_size=22,
                fill=subtitle_fill,
                align='center',
            ),
        ],
    }


def _section_slide(
    heading: str,
    body: str,
    *,
    bg: str = '#FFFFFF',
    heading_fill: str = '#0F172A',
    body_fill: str = '#475569',
) -> dict[str, Any]:
    return {
        'title': heading[:48],
        'background_color': bg,
        'canvas_data': [
            _text(
                heading,
                x=80,
                y=72,
                w=SLIDE_W - 160,
                h=56,
                font_size=40,
                fill=heading_fill,
                bold=True,
            ),
            _text(
                body,
                x=80,
                y=160,
                w=SLIDE_W - 160,
                h=SLIDE_H - 220,
                font_size=22,
                fill=body_fill,
            ),
        ],
    }


def _blank_slide() -> dict[str, Any]:
    return {
        'title': 'Slide 1',
        'background_color': '#FFFFFF',
        'canvas_data': [],
    }


def _client_concept_slides() -> list[dict[str, Any]]:
    return [
        _cover_slide('Concept presentation', 'Interior design direction for client review'),
        _section_slide(
            'Project overview',
            'Brief summary of the space, client goals, and design priorities.\n\n'
            '• Property type and scope\n'
            '• Key rooms in this phase\n'
            '• Budget and timeline notes',
            bg='#F8FAFC',
        ),
        {
            'title': 'Concept direction',
            'background_color': '#FFFFFF',
            'canvas_data': [
                _text('Concept direction', x=80, y=72, w=600, h=48, font_size=36, bold=True),
                *_image_frame('Mood image', x=80, y=160, w=520, h=480),
                _text(
                    'Design narrative\n\nDescribe palette, materials, and atmosphere.',
                    x=640,
                    y=160,
                    w=560,
                    h=480,
                    font_size=20,
                    fill='#475569',
                ),
            ],
        },
        {
            'title': 'Materials & finishes',
            'background_color': '#FFFBEB',
            'canvas_data': [
                _text('Materials & finishes', x=80, y=72, w=700, h=48, font_size=36, bold=True),
                *_image_frame('Finish sample', x=80, y=160, w=360, h=280),
                *_image_frame('Finish sample', x=460, y=160, w=360, h=280),
                *_image_frame('Finish sample', x=840, y=160, w=360, h=280),
                _text(
                    'Add supplier references and lead times where known.',
                    x=80,
                    y=470,
                    w=1120,
                    h=80,
                    font_size=18,
                    fill='#78716C',
                ),
            ],
        },
        _section_slide(
            'Next steps',
            '• Client feedback by [date]\n'
            '• Revisions to concept boards\n'
            '• Proceed to detail design / procurement\n'
            '• Deposit invoice per proposal terms',
            bg='#ECFDF5',
        ),
    ]


def _ffe_selection_slides() -> list[dict[str, Any]]:
    return [
        _cover_slide('FF&E selections', 'Furniture, fixtures & equipment for approval', bg='#0F172A'),
        _section_slide(
            'Room overview',
            'List rooms included in this selection deck and any exclusions.\n\n'
            'Use product pins on the next slide to link library items.',
            bg='#F8FAFC',
        ),
        {
            'title': 'Product selections',
            'background_color': '#FFFFFF',
            'canvas_data': [
                _text('Product selections', x=80, y=56, w=600, h=44, font_size=34, bold=True),
                _text(
                    'Add product pins from the editor toolbar, or drop images from your library.',
                    x=80,
                    y=108,
                    w=900,
                    h=32,
                    font_size=16,
                    fill='#64748B',
                ),
                *_image_frame('Product A', x=80, y=180, w=360, h=300),
                *_image_frame('Product B', x=460, y=180, w=360, h=300),
                *_image_frame('Product C', x=840, y=180, w=360, h=300),
                _text(
                    'Qty · Supplier · Lead time · Client approval',
                    x=80,
                    y=520,
                    w=1120,
                    h=40,
                    font_size=16,
                    fill='#94A3B8',
                    align='center',
                ),
            ],
        },
        _section_slide(
            'Summary & approvals',
            '• Items marked for client approval\n'
            '• Alternates if lead times slip\n'
            '• PO schedule after sign-off',
            bg='#EFF6FF',
        ),
    ]


def _mood_inspiration_slides() -> list[dict[str, Any]]:
    slides = [
        _cover_slide('Mood & inspiration', 'Visual direction for the project', bg='#1E293B'),
    ]
    for i in range(1, 4):
        slides.append({
            'title': f'Inspiration {i}',
            'background_color': '#FFFFFF',
            'canvas_data': [
                _text(f'Inspiration {i}', x=80, y=56, w=400, h=40, font_size=30, bold=True),
                *_image_frame('Drop inspiration image', x=80, y=120, w=1120, h=520),
            ],
        })
    slides.append(
        _section_slide(
            'Direction notes',
            'Summarise the thread across these images: palette, texture, form, and lighting.',
            bg='#FAF5FF',
        )
    )
    return slides


def _project_kickoff_slides() -> list[dict[str, Any]]:
    return [
        _cover_slide('Project kickoff', 'Scope, timeline, and ways of working'),
        _section_slide(
            'Scope of work',
            '• Design phases covered\n'
            '• Deliverables (drawings, specs, procurement)\n'
            '• Exclusions and client responsibilities',
            bg='#F8FAFC',
        ),
        {
            'title': 'Timeline',
            'background_color': '#FFFFFF',
            'canvas_data': [
                _text('Project timeline', x=80, y=72, w=500, h=48, font_size=36, bold=True),
                _text('Phase 1 — Concept', x=80, y=180, w=320, h=36, font_size=20, bold=True),
                _text('Weeks 1–4', x=80, y=220, w=320, h=28, font_size=16, fill='#64748B'),
                _text('Phase 2 — Detail design', x=440, y=180, w=320, h=36, font_size=20, bold=True),
                _text('Weeks 5–10', x=440, y=220, w=320, h=28, font_size=16, fill='#64748B'),
                _text('Phase 3 — Procurement & install', x=800, y=180, w=360, h=36, font_size=20, bold=True),
                _text('Weeks 11+', x=800, y=220, w=360, h=28, font_size=16, fill='#64748B'),
                {
                    'id': _el_id(),
                    'type': 'shape',
                    'x': 80,
                    'y': 300,
                    'w': 1120,
                    'h': 8,
                    'z': 0,
                    'props': {'shapeType': 'rect', 'fill': '#E2E8F0', 'stroke': '#E2E8F0'},
                },
                _text(
                    'Add key milestones, client decision dates, and site visits.',
                    x=80,
                    y=360,
                    w=1120,
                    h=200,
                    font_size=20,
                    fill='#475569',
                ),
            ],
        },
        _section_slide(
            'Project team',
            '• Studio lead and day-to-day contact\n'
            '• Client decision-makers\n'
            '• Contractors and suppliers on this project',
            bg='#FFF1F2',
        ),
        _section_slide(
            'Questions & feedback',
            'How to reach the studio, approval turnaround, and what we need from you this week.',
            bg='#ECFDF5',
        ),
    ]


TEMPLATE_BUILDERS = {
    'blank': lambda: [_blank_slide()],
    'client-concept': _client_concept_slides,
    'ffe-selection': _ffe_selection_slides,
    'mood-inspiration': _mood_inspiration_slides,
    'project-kickoff': _project_kickoff_slides,
}


TEMPLATE_CATALOG = [
    {
        'id': 'blank',
        'name': 'Blank',
        'description': 'Single empty slide — start from scratch.',
        'category': 'general',
        'slide_count': 1,
    },
    {
        'id': 'client-concept',
        'name': 'Client concept review',
        'description': 'Cover, overview, concept board, materials, and next steps.',
        'category': 'client',
        'slide_count': 5,
    },
    {
        'id': 'ffe-selection',
        'name': 'FF&E selections',
        'description': 'Product selection deck with pin placeholders and approval summary.',
        'category': 'procurement',
        'slide_count': 4,
    },
    {
        'id': 'mood-inspiration',
        'name': 'Mood & inspiration',
        'description': 'Full-bleed inspiration slides plus direction notes.',
        'category': 'design',
        'slide_count': 5,
    },
    {
        'id': 'project-kickoff',
        'name': 'Project kickoff',
        'description': 'Scope, timeline, team, and questions for project start.',
        'category': 'project',
        'slide_count': 5,
    },
]


def build_slides_for_template(template_id: str) -> list[dict[str, Any]]:
    """Return slide dicts ready for PresentationSlide.objects.create (deep copy)."""
    builder = TEMPLATE_BUILDERS.get(template_id, TEMPLATE_BUILDERS['blank'])
    slides = builder() if callable(builder) else builder
    return copy.deepcopy(slides)


def list_presentation_templates() -> list[dict[str, Any]]:
    return copy.deepcopy(TEMPLATE_CATALOG)
