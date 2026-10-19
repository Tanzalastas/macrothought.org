"""Copy only the approved static preview files; never copy legacy screenshots or Git data."""
import argparse,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('destination',type=Path);args=parser.parse_args()
dest=args.destination.resolve()
if dest.exists(): raise SystemExit('Choose a new destination; existing output is preserved.')
dest.mkdir(parents=True)
for rel in ['index.html','skills.html','app.html','setup.html','LICENSE','README.md','assets/site.css','assets/site.js','assets/galaxy.svg','assets/favicon.svg']:
 source=root/rel; target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
for rel in ['plugins','.claude-plugin']:
 shutil.copytree(root/rel,dest/rel)
print(f'Portable preview prepared: {dest}')
