class StudioScopedMixin:
    """
    Enforces studio-level isolation for every HTTP method:
    - GET list/retrieve: get_queryset() filters by studio → 404 if wrong studio
    - PUT/PATCH/DELETE: get_object() → get_queryset() → 404 if wrong studio
    - POST: perform_create() forces studio=request.user.studio, ignoring any
      studio value the client may have sent in the request body
    """

    def get_queryset(self):
        qs = super().get_queryset()
        studio = getattr(self.request.user, 'studio', None)
        if studio is None:
            return qs.none()
        return qs.filter(studio=studio)

    def perform_create(self, serializer):
        serializer.save(studio=self.request.user.studio)
