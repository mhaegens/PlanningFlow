const field = document.getElementById('password');
const toggle = document.getElementById('show-password');
if (field && toggle) toggle.addEventListener('change', () => { field.type = toggle.checked ? 'text' : 'password'; });
const next = document.getElementById('gate-next');
if (next && /^#(journey|demand|ibp|compare|reference)$/.test(location.hash)) next.value = '/' + location.hash;
