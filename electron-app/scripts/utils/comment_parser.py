# utils/comment_parser.py

async def extract_comment_with_links(block):
    container = await block.query_selector("div.col-lg-9.col-md-9.col-sm-9")
    if not container:
        return None

    seen = set()
    comment_parts = []

    # Extract visible text from p, span, label inside the comment block
    for tag in await container.query_selector_all("p, span, label"):
        try:
            text = await tag.inner_text()
            cleaned = text.strip()
            if cleaned and cleaned not in seen:
                comment_parts.append(cleaned)
                seen.add(cleaned)
        except:
            continue

    # Extract hrefs only from <a> inside the same container
    for a in await container.query_selector_all("a[href]"):
        try:
            href = await a.get_attribute("href")
            cleaned = href.strip()
            if cleaned and cleaned not in seen:
                comment_parts.append(cleaned)
                seen.add(cleaned)
        except:
            continue

    return "\n\n".join(comment_parts).strip()

