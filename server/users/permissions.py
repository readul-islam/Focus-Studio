from rest_framework.permissions import BasePermission, SAFE_METHODS


def check_role_permission(user, permission):
    """
    Return True if the authenticated user has the given permission in their studio.

    Admins always pass. Non-admin roles are checked against the RolePermission table.
    Returns False for unauthenticated users or users without a studio/role assigned.
    """
    if not user or not user.is_authenticated:
        return False
    if not user.studio:
        return False
    role = getattr(user, 'role', None)
    if not role:
        return False
    # Admins always have everything
    if role == 'admin':
        return True
    from .models import RolePermission
    rp = RolePermission.objects.filter(
        studio=user.studio, role=role, permission=permission
    ).first()
    return bool(rp and rp.enabled)


class _ModulePermission(BasePermission):
    """
    Base class for module-level read/write/delete permission checks.

    Subclasses set `read_permission`, `write_permission`, and `delete_permission`.
    GET/HEAD/OPTIONS use `read_permission`; DELETE uses `delete_permission`;
    all other methods use `write_permission`.
    Setting a permission to None means that method group is always allowed (still requires auth).
    """
    read_permission = None
    write_permission = None
    delete_permission = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            perm = self.read_permission
        elif request.method == 'DELETE':
            perm = self.delete_permission
        else:
            perm = self.write_permission
        if perm is None:
            return True
        return check_role_permission(request.user, perm)


# ----- Module permission classes -----

class ProjectsViewPermission(_ModulePermission):
    """Controls access to the Projects module (view / edit / delete)."""
    read_permission = 'projects.view'
    write_permission = 'projects.edit'
    delete_permission = 'projects.delete'


class TasksViewPermission(_ModulePermission):
    """Controls access to the Tasks module (view / edit / delete)."""
    read_permission = 'tasks.view'
    write_permission = 'tasks.edit'
    delete_permission = 'tasks.delete'


class FinanceViewPermission(_ModulePermission):
    """Controls access to the Finance module (view / edit / delete)."""
    read_permission = 'finance.view'
    write_permission = 'finance.edit'
    delete_permission = 'finance.delete'


class ClientsViewPermission(_ModulePermission):
    """Controls access to the Clients module (view / edit / delete)."""
    read_permission = 'clients.view'
    write_permission = 'clients.edit'
    delete_permission = 'clients.delete'


class LibraryViewPermission(_ModulePermission):
    """Controls access to the Library module (view / edit / delete)."""
    read_permission = 'library.view'
    write_permission = 'library.edit'
    delete_permission = 'library.delete'


class TeamViewPermission(_ModulePermission):
    """Controls access to the Team module (view / edit / delete)."""
    read_permission = 'team.view'
    write_permission = 'team.edit'
    delete_permission = 'team.delete'


class DocumentsViewPermission(_ModulePermission):
    """Controls access to the Documents module (view / edit / delete)."""
    read_permission = 'documents.view'
    write_permission = 'documents.edit'
    delete_permission = 'documents.delete'


class ReportsViewPermission(_ModulePermission):
    """Controls access to the Reports module (view only; write and delete are not permitted)."""
    read_permission = 'reports.view'
    write_permission = None


class DesignViewPermission(_ModulePermission):
    """Controls access to the Design AI workspace (view / edit)."""
    read_permission = 'design.view'
    write_permission = 'design.edit'
    delete_permission = None


class PresentationsViewPermission(_ModulePermission):
    """Controls access to the Presentations module (view / edit / delete)."""
    read_permission = 'presentations.view'
    write_permission = 'presentations.edit'
    delete_permission = 'presentations.delete'
