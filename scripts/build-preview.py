#!/usr/bin/env python3
"""Build a new, verified preview with the pinned Jekyll toolchain.

Run `bundle install` first. Generated output is never assembled by copying source.
An existing destination is preserved; choose a new destination for each review.
"""

import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile


def main():
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", nargs="?", type=Path, default=root / "_site")
    parser.add_argument("--publication", action="store_true", help="Also enforce release and media approval gates")
    parser.add_argument("--report", type=Path, help="Write verification evidence outside the document root")
    args = parser.parse_args()
    destination = args.destination.resolve()
    if destination.exists():
        parser.error("Choose a new destination; existing output is preserved.")
    if destination == root or destination in root.parents:
        parser.error("The destination cannot contain the source checkout.")
    environment = os.environ.copy()
    environment["JEKYLL_ENV"] = "production"
    environment["BUNDLE_GEMFILE"] = str(root / "Gemfile")
    environment["BUNDLE_FROZEN"] = "true"
    try:
        version = subprocess.check_output(
            ["bundle", "exec", "jekyll", "--version"], cwd=root, env=environment, text=True
        ).strip()
        if version != "jekyll 3.10.0":
            raise SystemExit(f"Expected the pinned Jekyll 3.10.0; received {version!r}.")
        # Jekyll 3's incremental metadata stays disabled. Any Sass cache belongs
        # to this temporary build directory, never the source or public output.
        with tempfile.TemporaryDirectory(prefix="macrothought-jekyll-") as temporary:
            override = Path(temporary) / "preview.yml"
            override.write_text(json.dumps({
                "incremental": False,
                "sass": {"cache": False, "cache_location": str(Path(temporary) / "sass")},
            }))
            subprocess.run([
                "bundle", "exec", "jekyll", "build", "--trace", "--strict_front_matter",
                "--source", str(root), "--destination", str(destination),
                "--config", f"{root / '_config.yml'},{override}",
            ], cwd=root, env=environment, check=True)
        command = [sys.executable, str(root / "scripts/verify-site.py"), str(destination)]
        if args.publication:
            command.append("--publication")
        if args.report:
            command.extend(["--report", str(args.report.resolve())])
        subprocess.run(command, cwd=root, env=environment, check=True)
    except FileNotFoundError as error:
        raise SystemExit(f"Build tool unavailable: {error.filename}. Install Ruby and run bundle install.") from error
    except subprocess.CalledProcessError as error:
        raise SystemExit(f"Build or verification failed (exit {error.returncode}); output remains at {destination}.") from error
    print(f"Verified {version} preview: {destination}")


if __name__ == "__main__":
    main()
