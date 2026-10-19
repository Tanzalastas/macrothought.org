'use strict';
document.documentElement.classList.add('js');
// This illustrative interaction is deliberately self-contained: no network or storage.
const examples = {
  'field-notes': {title: 'Field notes', description: 'A draft observation linked to its sources and the checklist used to review it.', status: 'Draft · review pending'},
  'source-library': {title: 'Source library', description: 'An invented collection of references for the Field Atlas project. A reference is not proof that its contents were checked.', status: 'Collected · checks pending'},
  'review-checklist': {title: 'Review checklist', description: 'The questions a reviewer would use to test the draft. A requested review is not a passing result.', status: 'Review requested'}
};
const tabs = [...document.querySelectorAll('[data-view]')];
function setView(tab) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setView(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault(); setView(tabs[next]); tabs[next].focus();
  });
});
document.querySelectorAll('[data-node]').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.node, entry = examples[id];
    document.querySelectorAll('[data-node]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.node === id)));
    document.getElementById('object-title').textContent = entry.title;
    document.getElementById('object-description').textContent = entry.description;
    document.getElementById('object-id').textContent = 'example:' + id;
    document.getElementById('object-status').textContent = entry.status;
  });
});
const search = document.getElementById('q');
if (search) search.addEventListener('input', () => {
  const query = search.value.toLocaleLowerCase().trim();
  let total = 0, departments = 0;
  document.querySelectorAll('.skills-catalog section').forEach(section => {
    let count = 0;
    section.querySelectorAll('.sk').forEach(skill => { skill.hidden = !skill.dataset.q.includes(query); if (!skill.hidden) count++; });
    section.hidden = count === 0;
    if (count) departments++;
    total += count;
  });
  document.getElementById('skill-count').textContent = `${total} ${total === 1 ? 'skill' : 'skills'} in ${departments} ${departments === 1 ? 'department' : 'departments'}`;
  document.getElementById('no-results').hidden = total !== 0;
});
