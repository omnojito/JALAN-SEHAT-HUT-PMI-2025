// GANTI dengan URL Web App Google Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbz0F1u7rFo39CLzdR51vJ71tDiXx4U4QS7AWjY43r8M2C17qA5-qyMl1NhlFhbTda92VA/exec';

const form = document.getElementById('formPeserta');
const tabelBody = document.querySelector('#tabelPeserta tbody');
const statusEl = document.getElementById('status');
const btnReset = document.getElementById('btnReset');
const btnExport = document.getElementById('btnExport');

let pesertaList = []; // will hold {row: number, nama, alamat, nik, instansi, kupon}

// load data from Google Sheets
async function loadData() {
  statusEl.textContent = 'Memuat data...';
  try {
    const res = await fetch(API_URL + '?action=read');
    if(!res.ok) throw new Error('Gagal mengambil data');
    const data = await res.json();
    // data is array of objects with rowNumber
    pesertaList = data;
    renderTable();
    statusEl.textContent = 'Data terbarui';
  } catch (err) {
    statusEl.textContent = 'Error memuat data: ' + err.message;
    console.error(err);
  }
}

function renderTable(){
  tabelBody.innerHTML = '';
  if(!pesertaList.length){ tabelBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280">Belum ada peserta terdaftar</td></tr>'; return; }
  pesertaList.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${escapeHtml(p.nama)}</td>
      <td>${escapeHtml(p.alamat)}</td>
      <td>${escapeHtml(p.nik)}</td>
      <td>${escapeHtml(p.instansi)}</td>
      <td>${escapeHtml(p.kupon)}</td>
      <td>
        <button class="action-btn action-edit" onclick="startEdit(${p.row})">Edit</button>
        <button class="action-btn action-delete" onclick="deleteRow(${p.row})">Hapus</button>
      </td>
    `;
    tabelBody.appendChild(tr);
  });
}

function escapeHtml(s){ if(s===undefined||s===null) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    nama: document.getElementById('nama').value.trim(),
    alamat: document.getElementById('alamat').value.trim(),
    nik: document.getElementById('nik').value.trim(),
    instansi: document.getElementById('instansi').value.trim(),
    kupon: document.getElementById('kupon').value.trim()
  };
  // basic validation
  if(!data.nama||!data.alamat||!data.nik){ alert('Nama, Alamat, dan NIK wajib diisi'); return; }
  // check duplicate NIK on client before sending
  if(pesertaList.some(p=>p.nik===data.nik)){ alert('NIK sudah terdaftar'); return; }
  try {
    statusEl.textContent = 'Menyimpan...';
    await fetch(API_URL + '?action=create', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    form.reset();
    await loadData();
  } catch(err){
    statusEl.textContent = 'Error menyimpan: '+err.message;
    console.error(err);
  }
});

btnReset.addEventListener('click', ()=> form.reset());

// start edit by filling form and setting hidden editRow (we'll implement update as delete+create)
function startEdit(rowNumber){
  const p = pesertaList.find(x=>x.row===rowNumber);
  if(!p) return;
  document.getElementById('nama').value = p.nama;
  document.getElementById('alamat').value = p.alamat;
  document.getElementById('nik').value = p.nik;
  document.getElementById('instansi').value = p.instansi;
  document.getElementById('kupon').value = p.kupon;
  // delete the existing row so when user saves it's added as new row
  if(confirm('Siapkan formulir untuk edit. Klik OK untuk menghapus baris lama (akan dibuat ulang saat disimpan).')) {
    deleteRow(rowNumber).then(()=>{ loadData(); });
  }
}

// delete row by row number (as returned from server)
async function deleteRow(rowNumber){
  if(!confirm('Hapus data peserta ini?')) return;
  try {
    await fetch(API_URL + '?action=delete&row=' + rowNumber);
    await loadData();
  } catch(err){
    console.error(err);
  }
}

// export to Excel (sheet full table + sheets per column)
btnExport.addEventListener('click', async ()=>{
  await loadData(); // ensure fresh
  const data = pesertaList.map(p => ({Nama:p.nama, Alamat:p.alamat, NIK:p.nik, Instansi:p.instansi, Kupon:p.kupon}));
  const wb = XLSX.utils.book_new();
  // full sheet
  const wsFull = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, wsFull, 'Data_Lengkap');
  // per-column sheets
  const names = [['Nama'], ...pesertaList.map(p=>[p.nama])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(names), 'Nama');
  const addrs = [['Alamat'], ...pesertaList.map(p=>[p.alamat])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(addrs), 'Alamat');
  const niks = [['NIK'], ...pesertaList.map(p=>[p.nik])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(niks), 'NIK');
  const insts = [['Instansi'], ...pesertaList.map(p=>[p.instansi])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(insts), 'Instansi');
  const kupons = [['Kupon'], ...pesertaList.map(p=>[p.kupon])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kupons), 'Kupon');
  XLSX.writeFile(wb, 'daftar_peserta_online.xlsx');
});

// initial load
loadData();
