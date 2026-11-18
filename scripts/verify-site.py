#!/usr/bin/env python3
"""Verify generated Jekyll output, internal references, and media provenance."""

import argparse
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import posixpath
import re
import subprocess
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.media = set()
        self.errors = []
        self.h1_count = 0
        self.has_main = False
        self.has_lang = False
        self.has_viewport = False
        self.has_title = False
        self.in_title = False
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        identifier = attrs.get("id")
        if identifier:
            if identifier in self.ids:
                self.errors.append(f"duplicate id: {identifier}")
            self.ids.add(identifier)
        for attribute in ("href", "src", "poster"):
            if attrs.get(attribute):
                self.references.append((attribute, attrs[attribute]))
        if "data-media-id" in attrs:
            self.media.add(attrs["data-media-id"])
        if tag == "h1":
            self.h1_count += 1
        if tag == "main":
            self.has_main = True
        if tag == "html":
            self.has_lang = bool(attrs.get("lang"))
        if tag == "meta" and attrs.get("name") == "viewport":
            self.has_viewport = True
        if tag == "title":
            self.in_title = True
        if tag == "img" and "alt" not in attrs:
            self.errors.append(f"image missing alt: {attrs.get('src')}")
        if tag == "video":
            if "controls" not in attrs or "autoplay" in attrs or attrs.get("preload") != "none":
                self.errors.append("video must have controls, preload=none, and no autoplay")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title and data.strip():
            self.has_title = True


def read_yaml(path):
    # Ruby/Psych is already required by the pinned Jekyll build. Keep Python's
    # verifier dependency-free and load metadata without arbitrary YAML classes.
    script = "puts JSON.generate(YAML.safe_load(File.read(ARGV[0]), permitted_classes: [Date, Time], aliases: false))"
    result = subprocess.run(["ruby", "-rjson", "-ryaml", "-rdate", "-e", script, str(path)],
                            text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


def verify_discovery(root, site, pages, errors):
    configuration = read_yaml(root / "_config.yml")
    origin = configuration["url"].rstrip("/") + configuration.get("baseurl", "").rstrip("/")
    expected = set()
    for name in pages:
        if name == "404.html":
            # GitHub Pages serves 404.html for missing paths; it is not a page to index.
            continue
        route = "/" + name
        if route.endswith("/index.html"):
            route = route[:-len("index.html")]
        expected.add(origin + route)
    try:
        sitemap = ET.parse(site / "sitemap.xml").getroot()
        namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        if sitemap.tag != namespace + "urlset":
            errors.append("sitemap.xml: expected a sitemap urlset")
        locations = [node.text.strip() if node.text else "" for node in sitemap.findall(f"{namespace}url/{namespace}loc")]
        if len(locations) != len(set(locations)):
            errors.append("sitemap.xml: duplicate URLs")
        errors.extend(f"sitemap.xml: missing generated page {url}" for url in sorted(expected - set(locations)))
        errors.extend(f"sitemap.xml: URL is not a generated page {url}" for url in sorted(set(locations) - expected))
    except (ET.ParseError, OSError) as error:
        errors.append(f"sitemap.xml: cannot parse sitemap: {error}")
    try:
        feed = ET.parse(site / "feed.xml").getroot()
        if feed.tag != "rss" or feed.find("channel") is None:
            errors.append("feed.xml: expected an RSS channel")
        posts = {url for url in expected if url.startswith(origin + "/devlog/") and url != origin + "/devlog/"}
        links = []
        for item in feed.findall("channel/item"):
            link = (item.findtext("link") or "").strip()
            links.append(link)
            if link not in posts:
                errors.append(f"feed.xml: entry does not target a generated post: {link}")
            if (item.findtext("guid") or "").strip() != link:
                errors.append(f"feed.xml: entry GUID differs from its post URL: {link}")
        if len(links) != len(set(links)):
            errors.append("feed.xml: duplicate post entries")
        errors.extend(f"feed.xml: missing generated post {url}" for url in sorted(posts - set(links)))
    except (ET.ParseError, OSError) as error:
        errors.append(f"feed.xml: cannot parse RSS: {error}")


def validate(root, site, publication=False):
    errors = []
    manifest = json.loads((root / "public-files.json").read_text())
    files = manifest["files"]
    if len(files) != len(set(files)):
        errors.append("public-files.json contains duplicate paths")
    for name in files:
        path = PurePosixPath(name)
        if path.is_absolute() or ".." in path.parts or str(path) != name or "\\" in name:
            errors.append(f"unsafe or noncanonical manifest path: {name}")
    allowed = set(files)
    actual = set()
    for path in site.rglob("*"):
        if path.is_symlink():
            errors.append(f"output contains a symlink: {path.relative_to(site)}")
        elif path.is_file():
            actual.add(path.relative_to(site).as_posix())
    errors.extend(f"missing output: {name}" for name in sorted(allowed - actual))
    errors.extend(f"unexpected output: {name}" for name in sorted(actual - allowed))
    pages = {name: Page((site / name).read_text()) for name in sorted(actual) if name.endswith(".html")}
    used_media = set()
    referenced_files = set()
    for name, page in pages.items():
        errors.extend(f"{name}: {error}" for error in page.errors)
        for label, present in (("exactly one h1", page.h1_count == 1), ("main landmark", page.has_main),
                               ("document language", page.has_lang), ("viewport", page.has_viewport),
                               ("document title", page.has_title)):
            if not present:
                errors.append(f"{name}: missing {label}")
        used_media.update(page.media)
        for attribute, reference in page.references:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                continue
            resolved = urlsplit(urljoin("/" + name, reference))
            target = unquote(resolved.path).lstrip("/")
            target = posixpath.normpath(target)
            if resolved.path.endswith("/") or not target or target == ".":
                target = (target.rstrip("/") + "/index.html").lstrip("./")
            if target not in actual:
                errors.append(f"{name}: broken {attribute} {reference!r} (target {target})")
            elif resolved.fragment and target in pages and unquote(resolved.fragment) not in pages[target].ids:
                errors.append(f"{name}: missing fragment {reference!r}")
            referenced_files.add(target)
    media = read_yaml(root / "_data/media.yml") or {}
    release = read_yaml(root / "_data/release.yml") or {}
    # Public files remain accessible even when no page links them. Every raster
    # image or video in the output needs inventory, integrity and approval checks.
    media_suffixes = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".apng", ".bmp", ".tif", ".tiff",
                      ".mp4", ".webm", ".mov", ".ogv", ".m4v", ".avi", ".mkv"}
    public_media = {name for name in actual if PurePosixPath(name).suffix.lower() in media_suffixes}
    inventoried = set()
    for identifier, entry in media.items():
        if isinstance(entry, dict):
            names = {str(entry.get(key, "")).lstrip("/") for key in ("src", "poster")}
            inventoried.update(names)
            if names & (referenced_files | public_media):
                used_media.add(identifier)
    errors.extend(f"uninventoried public media: {name}" for name in sorted(public_media - inventoried))
    if publication and release.get("publication_ready") is not True:
        errors.append("publication blocked: _data/release.yml publication_ready must be true")
    for identifier in sorted(used_media):
        entry = media.get(identifier)
        if not isinstance(entry, dict):
            errors.append(f"unknown media id: {identifier}")
            continue
        if entry.get("review_status") not in ("reviewed-public-history", "approved"):
            errors.append(f"{identifier}: media lacks provenance review")
        if not re.fullmatch(r"[0-9a-f]{40}", str(entry.get("source_commit", ""))):
            errors.append(f"{identifier}: missing exact source commit")
        if publication and entry.get("publication_status") != "approved":
            errors.append(f"publication blocked: {identifier} publication_status must be approved")
        for key in ("src", "poster"):
            if key not in entry:
                continue
            name = str(entry[key]).lstrip("/")
            digest_key = "sha256" if key == "src" else "poster_sha256"
            if name not in actual or name not in allowed:
                errors.append(f"{identifier}: {key} is not present in allowed output: {name}")
                continue
            digest = hashlib.sha256((site / name).read_bytes()).hexdigest()
            if digest != entry.get(digest_key):
                errors.append(f"{identifier}: {digest_key} does not match {name}")
    verify_discovery(root, site, pages, errors)
    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "source": str(root), "site": str(site), "publication": publication,
        "files": len(actual), "pages": len(pages), "used_media": sorted(used_media),
        "inputs_sha256": {name: hashlib.sha256((root / name).read_bytes()).hexdigest()
                          for name in ("public-files.json", "_config.yml", "_data/media.yml", "_data/release.yml")},
        "output_sha256": {name: hashlib.sha256((site / name).read_bytes()).hexdigest() for name in sorted(actual)},
        "errors": errors, "passed": not errors,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("--source", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--publication", action="store_true")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    site = args.site.resolve()
    if not site.is_dir():
        parser.error(f"Generated site directory not found: {site}")
    if args.report and (args.report.resolve() == site or site in args.report.resolve().parents):
        parser.error("Evidence reports must be outside the document root.")
    try:
        report = validate(args.source.resolve(), site, args.publication)
    except (KeyError, ValueError, OSError, subprocess.CalledProcessError) as error:
        raise SystemExit(f"Verification could not complete: {error}") from error
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
