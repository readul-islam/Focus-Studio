"""Default project phases used when a project has none (e.g. Notion sync)."""

from .models import Phase, Project

DEFAULT_PROJECT_PHASES = [
    ('Feasibility & Briefing', 'Initial discovery and research phase'),
    ('Concept Design', 'Conceptual design development'),
    ('Design Development', 'Detailed design development'),
    ('Technical Drawings', 'Technical drawings and documentation'),
    ('Procurement', 'Procurement and sourcing'),
    ('Site / Implementation', 'On-site implementation and installation'),
]


def seed_default_phases_for_project(project: Project, studio, user=None) -> list[Phase]:
    """
    Attach standard phases to a project if it has none.
    Returns created phases (empty if project already had phases).
    """
    if project.phases.exists():
        return list(project.phases.all())

    created: list[Phase] = []
    for name, description in DEFAULT_PROJECT_PHASES:
        phase = Phase.objects.create(
            name=name,
            description=description,
            progress=0,
            studio=studio,
            created_by=user,
            updated_by=user,
        )
        project.phases.add(phase)
        created.append(phase)
    return created
