def try_int(val, default=None):
    """Return int or default value."""
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def is_none(val):
    return val is None
