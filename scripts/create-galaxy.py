"""Build an original, deterministic SVG illustration. No project data is read."""
import math,random
from pathlib import Path
r=random.Random(19)
s=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 760" fill="none"><defs><radialGradient id="halo"><stop stop-color="#c2b9eb" stop-opacity=".19"/><stop offset="1" stop-color="#181a2c" stop-opacity="0"/></radialGradient><radialGradient id="core"><stop stop-color="#fff6dc"/><stop offset=".12" stop-color="#eed7af" stop-opacity=".9"/><stop offset=".4" stop-color="#a99ce4" stop-opacity=".18"/><stop offset="1" stop-color="#a99ce4" stop-opacity="0"/></radialGradient></defs><ellipse cx="500" cy="380" rx="485" ry="345" fill="url(#halo)"/>']
# Perspective-projected logarithmic spiral; the same fixed seed makes previews reproducible.
def xy(t,arm,offset=0):
 a=t*6.7+arm*math.pi/2
 rad=26+380*t
 return 500+math.cos(a)*rad+offset,380+math.sin(a)*rad*.63+math.cos(a)*rad*.12+offset*.3
for arm,col in enumerate(['#b6aae3','#8cbdc5','#d3b681','#959ed0']):
 points=[xy(k/150,arm) for k in range(151)]
 s.append('<path d="M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in points)+'" stroke="'+col+'" stroke-opacity=".16"/>')
 for j in range(360):
  t=r.random();x,y=xy(t,arm,r.gauss(0,11+17*t));radius=r.choice([.7,1,1.2,1.8,2.2])
  s.append(f'<circle cx="{x:.1f}" cy="{y+r.gauss(0,8+7*t):.1f}" r="{radius}" fill="{col}" opacity="{r.uniform(.25,.85):.2f}"/>')
for j in range(65):
 s.append(f'<circle cx="{r.uniform(80,920):.1f}" cy="{r.uniform(80,680):.1f}" r=".8" fill="#b9c0df" opacity=".24"/>')
s.append('<circle cx="500" cy="380" r="120" fill="url(#core)"/><circle cx="500" cy="380" r="4" fill="#fff6dc"/></svg>')
Path(__file__).resolve().parents[1].joinpath('assets/galaxy.svg').write_text(''.join(s))
