from fastapi import Query


def paging(
    page: int = Query(1, ge=1),
    perPage: int = Query(30, ge=1, le=500),
    sort: str | None = None,
    filter: str | None = None,
    expand: str | None = None,
    fields: str | None = None,
    skipTotal: bool = False,
):
    """PocketBase-compatible list/search query parameters."""
    return {
        "page": page,
        "perPage": perPage,
        "sort": sort,
        "filter": filter,
        "expand": expand,
        "fields": fields,
        "skipTotal": skipTotal,
    }


def with_defaults(params: dict, *, sort: str | None = None, expand: str | None = None) -> dict:
    result = dict(params)
    if not result.get("sort") and sort:
        result["sort"] = sort
    if not result.get("expand") and expand:
        result["expand"] = expand
    return result
