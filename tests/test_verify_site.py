"""Regression checks for the generated output and explicit publication gates."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("verify_site", Path(__file__).resolve().parents[1] / "scripts/verify-site.py")
VERIFY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFY)


class GeneratedSiteTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "source"
        self.site = Path(self.temporary.name) / "output"
        (self.root / "_data").mkdir(parents=True)
        (self.site / "assets").mkdir(parents=True)
        (self.site / "docs").mkdir()
        self.write_json("public-files.json", {"files": ["index.html", "docs/index.html", "assets/capture.jpg", "sitemap.xml", "feed.xml"]})
        self.write_json("_config.yml", {"url": "https://example.test", "baseurl": ""})
        (self.site / "sitemap.xml").write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.test/</loc></url><url><loc>https://example.test/docs/</loc></url></urlset>')
        (self.site / "feed.xml").write_text('<rss version="2.0"><channel><title>Journal</title></channel></rss>')
        self.media = {"capture": {"type": "image", "src": "/assets/capture.jpg",
                                  "source_commit": "a" * 40,
                                  "sha256": hashlib.sha256(b"fixture media").hexdigest(),
                                  "review_status": "reviewed-public-history",
                                  "publication_status": "pending-main-thread-review"}}
        self.write_json("_data/media.yml", self.media)
        self.write_json("_data/release.yml", {"publication_ready": False})
        (self.site / "assets/capture.jpg").write_bytes(b"fixture media")
        self.html = '<html lang="en"><head><title>Guide</title><meta name="viewport" content="width=device-width"></head><body><main><h1>Guide</h1><h2 id="start">Start</h2><a href="/docs/#start">Read the guide</a><img src="/assets/capture.jpg" alt="Historical capture"></main></body></html>'
        for name in ("index.html", "docs/index.html"):
            (self.site / name).write_text(self.html)

    def write_json(self, name, value):
        # JSON is valid YAML, and keeps this fixture independent of a YAML writer.
        (self.root / name).write_text(json.dumps(value))

    def test_preview_passes_but_publication_requires_both_explicit_approvals(self):
        self.assertTrue(VERIFY.validate(self.root, self.site)["passed"])
        report = VERIFY.validate(self.root, self.site, publication=True)
        self.assertFalse(report["passed"])
        self.assertEqual(len(report["errors"]), 2)
        self.media["capture"]["publication_status"] = "approved"
        self.write_json("_data/media.yml", self.media)
        self.assertFalse(VERIFY.validate(self.root, self.site, publication=True)["passed"])
        self.write_json("_data/release.yml", {"publication_ready": True})
        self.assertTrue(VERIFY.validate(self.root, self.site, publication=True)["passed"])

    def test_extra_source_file_and_changed_media_are_rejected(self):
        (self.site / "README.md").write_text("Private source must not be published")
        (self.site / "assets/capture.jpg").write_bytes(b"changed fixture")
        errors = VERIFY.validate(self.root, self.site)["errors"]
        self.assertIn("unexpected output: README.md", errors)
        self.assertTrue(any("sha256 does not match" in error for error in errors))

    def test_missing_route_fragment_and_duplicate_id_are_rejected(self):
        (self.site / "index.html").write_text(self.html.replace('/docs/#start', '/docs/#absent').replace('</main>', '<p id="start">Duplicate</p><a href="/missing/">Missing</a></main>'))
        errors = VERIFY.validate(self.root, self.site)["errors"]
        self.assertTrue(any("missing fragment" in error for error in errors))
        self.assertTrue(any("duplicate id" in error for error in errors))
        self.assertTrue(any("broken href" in error for error in errors))

    def test_orphan_media_requires_inventory_and_publication_approval(self):
        for name in ("index.html", "docs/index.html"):
            (self.site / name).write_text(self.html.replace('<img src="/assets/capture.jpg" alt="Historical capture">', ""))
        self.assertTrue(VERIFY.validate(self.root, self.site)["passed"])
        self.assertTrue(any("capture publication_status" in error for error in VERIFY.validate(self.root, self.site, publication=True)["errors"]))
        self.write_json("_data/media.yml", {})
        self.assertIn("uninventoried public media: assets/capture.jpg", VERIFY.validate(self.root, self.site)["errors"])

    def test_malformed_sitemap_and_nonexistent_rss_post_are_rejected(self):
        (self.site / "sitemap.xml").write_text("<broken")
        (self.site / "feed.xml").write_text('<rss><channel><item><link>https://example.test/devlog/absent/</link><guid>https://example.test/devlog/absent/</guid></item></channel></rss>')
        errors = VERIFY.validate(self.root, self.site)["errors"]
        self.assertTrue(any("cannot parse sitemap" in error for error in errors))
        self.assertTrue(any("entry does not target a generated post" in error for error in errors))
        (self.site / "sitemap.xml").write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.test/missing/</loc></url></urlset>')
        errors = VERIFY.validate(self.root, self.site)["errors"]
        self.assertTrue(any("missing generated page" in error for error in errors))
        self.assertTrue(any("URL is not a generated page" in error for error in errors))

    def test_not_found_page_is_published_but_not_indexed(self):
        self.write_json("public-files.json", {"files": ["index.html", "docs/index.html", "404.html", "assets/capture.jpg", "sitemap.xml", "feed.xml"]})
        (self.site / "404.html").write_text(self.html.replace("<h1>Guide</h1>", "<h1>Not found</h1>"))
        self.assertTrue(VERIFY.validate(self.root, self.site)["passed"])
        (self.site / "sitemap.xml").write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.test/</loc></url><url><loc>https://example.test/docs/</loc></url><url><loc>https://example.test/404.html</loc></url></urlset>')
        self.assertIn("sitemap.xml: URL is not a generated page https://example.test/404.html", VERIFY.validate(self.root, self.site)["errors"])


if __name__ == "__main__":
    unittest.main()
