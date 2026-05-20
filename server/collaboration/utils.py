import re

from users.models import User

TEAM_MENTION_PATTERN = re.compile(r'@team\b', re.IGNORECASE)


def _studio_users(studio, exclude_user_id=None):
    qs = User.objects.filter(studio=studio)
    if exclude_user_id:
        qs = qs.exclude(id=exclude_user_id)
    return list(qs)


def find_mentioned_users(content: str, studio, exclude_user_id=None):
    """
    Resolve @team (all studio members) and @Full Name mentions.
    Returns a deduplicated list of User instances to notify.
    """
    if not content or not studio:
        return []

    mentioned = []
    seen_ids = set()
    if exclude_user_id:
        seen_ids.add(exclude_user_id)

    if TEAM_MENTION_PATTERN.search(content):
        for user in _studio_users(studio, exclude_user_id):
            if user.id not in seen_ids:
                mentioned.append(user)
                seen_ids.add(user.id)
        return mentioned

    studio_users = _studio_users(studio, exclude_user_id)
    studio_users.sort(key=lambda u: len(u.name or ''), reverse=True)

    for user in studio_users:
        if not user.name or user.id in seen_ids:
            continue
        pattern = rf'@{re.escape(user.name)}(?=\s|$|[.,!?])'
        if re.search(pattern, content, re.IGNORECASE):
            mentioned.append(user)
            seen_ids.add(user.id)

    return mentioned
