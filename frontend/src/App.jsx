import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://shrewdly-maximize-showgirl.ngrok-free.dev/api';

const bgGreen = '#2e4d37';
const bgLight = '#fdfefd';
const borderCol = '#cde0d2';

const Footer = () => (
  <div style={{ marginTop: 'auto', padding: '20px', textAlign: 'center', color: bgGreen, fontSize: '14px', fontWeight: 'bold', width: '100%' }}>
    ©2026 Bagas Mustoffa Althaf
  </div>
);

const CenterBox = ({ children, title }) => (
  <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', backgroundColor: bgLight, margin: 0 }}>
    <div style={{ padding: '40px', backgroundColor: 'white', border: `1px solid ${borderCol}`, borderRadius: '12px', textAlign: 'center', minWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {title && <h2 style={{ marginBottom: '30px', color: bgGreen, marginTop: 0 }}>{title}</h2>}
      {children}
    </div>
    <Footer />
  </div>
);

const InputField = ({ label, type, val, setVal, req = true, step }) => (
  <input type={type} step={step} placeholder={label} value={val} onChange={(e) => setVal(e.target.value)} required={req} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }} />
);

const SelectDeposito = ({ val, setVal, options }) => (
  <div style={{ marginBottom: '15px', textAlign: 'left' }}>
    <label style={{ fontSize: '14px', color: bgGreen, fontWeight: 'bold' }}>Deposito Type:</label>
    <select value={val} onChange={(e) => setVal(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>{opt.name} ({opt.yearly_return}%)</option>
      ))}
    </select>
  </div>
);

const Btn = ({ label, onClick, outline = false, type = "button", color = bgGreen }) => (
  <button type={type} onClick={onClick} style={{ width: '100%', padding: '14px', marginBottom: '10px', borderRadius: '25px', border: outline ? `1px solid ${color}` : 'none', backgroundColor: outline ? 'transparent' : color, color: outline ? color : 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
    {label}
  </button>
);

export default function App() {
  const [view, setView] = useState('HOME');
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [depositoTypes, setDepositoTypes] = useState([]);
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [depositoId, setDepositoId] = useState(1);
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  const [allCustomers, setAllCustomers] = useState([]);
  const [newDepoName, setNewDepoName] = useState('');
  const [newDepoReturn, setNewDepoReturn] = useState('');
  const [editingDepoId, setEditingDepoId] = useState(null);
  const [editDepoName, setEditDepoName] = useState('');
  const [editDepoReturn, setEditDepoReturn] = useState('');

  useEffect(() => {
    fetchDepositos();
  }, []);

  const fetchDepositos = async () => {
    try {
      const res = await axios.get(`${API_URL}/depositos`);
      setDepositoTypes(res.data.data || []);
    } catch(err) { 
      console.error(err); 
    }
  };

  const fetchAdminData = async () => {
    try {
      await fetchDepositos();
      const custRes = await axios.get(`${API_URL}/customers`);
      setAllCustomers(custRes.data.data || []);
    } catch (err) { console.error(err); }
  };

  const clearForms = () => {
    setName(''); setPass(''); setConfPass(''); setAmount(''); setErrorMsg(''); setAccountName(''); setDepositoId(1); setNewAccountName('');
  };

  const switchView = (target) => {
    clearForms();
    setView(target);
  };

  const refreshData = async (customerId) => {
    try {
      const customerRes = await axios.get(`${API_URL}/customers/${customerId}`);
      setCustomer(customerRes.data.data);

      const accRes = await axios.get(`${API_URL}/accounts/${customerId}`);
      const updatedAccounts = accRes.data.data || [];
      setAccounts(updatedAccounts);

      if (selectedAccount) {
        const updatedAcc = updatedAccounts.find(a => a.id === selectedAccount.id);
        if (updatedAcc) setSelectedAccount(updatedAcc);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_URL}/login`, { name, password: pass });
      const loggedCustomer = res.data.data;
      setCustomer(loggedCustomer);
      
      if (loggedCustomer.name === 'SuperAdmin') {
        await fetchAdminData();
        switchView('ADMIN_DASHBOARD');
      } else {
        const accRes = await axios.get(`${API_URL}/accounts/${loggedCustomer.id}`);
        setAccounts(accRes.data.data || []);
        switchView('SELECT_ACCOUNT'); 
      }
    } catch (err) { setErrorMsg("Nama Atau Password Tidak Sesuai"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (pass !== confPass) return setErrorMsg("Confirm Password tidak cocok dengan Password");
    
    try {
      const res = await axios.post(`${API_URL}/customers`, { name, password: pass, deposito_type_id: depositoId, packet: accountName });
      const newCustomer = res.data.data;
      setCustomer(newCustomer);

      const accRes = await axios.get(`${API_URL}/accounts/${newCustomer.id}`);
      setAccounts(accRes.data.data || []);

      switchView('SELECT_ACCOUNT'); 
    } catch (err) { setErrorMsg("Gagal: " + (err.response?.data?.error || err.message)); }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/accounts`, {
        packet: accountName,
        customer_id: customer.id,
        deposito_type_id: depositoId,
        balance: 0
      });
      
      alert("Akun Baru Berhasil Ditambahkan!");
      setAccountName('');
      if (depositoTypes.length > 0) setDepositoId(depositoTypes[0].id);
      refreshData(customer.id); 
      
    } catch (err) { 
      alert("Gagal Membuat Akun: " + (err.response?.data?.error || err.message)); 
    }
  };

  const handleDeleteAccount = async (e, accountId) => {
    e.stopPropagation();
    if (!window.confirm("Apakah Anda yakin ingin menghapus akun ini?")) return;
    
    try {
      await axios.delete(`${API_URL}/accounts/${accountId}`);
      alert("Akun berhasil dihapus!");
      refreshData(customer.id);
    } catch (err) {
      alert("Gagal menghapus akun: " + (err.response?.data?.error || err.message));
    }
  };

  const handleTransaction = async (type) => {
    if (!selectedAccount) return alert("Pilih akun terlebih dahulu!");
    const now = new Date().toISOString();
    const isDeposit = type === 'setor';
    const payload = {
      account_id: selectedAccount.id,
      amount: parseFloat(amount),
      [isDeposit ? 'deposit_date' : 'withdraw_date']: now
    };
    
    try {
      const res = await axios.post(`${API_URL}/transactions/${isDeposit ? 'deposit' : 'withdraw'}`, payload);
      alert(isDeposit ? "Setor Berhasil!" : `Tarik Berhasil!\n\nBunga Didapat: Rp${res.data.interest_earned}\nSaldo Akhir: Rp${res.data.current_final_balance}`);
      setAmount('');
      refreshData(customer.id);
    } catch (err) { alert("Transaksi Gagal: " + (err.response?.data?.error || err.message)); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (pass !== confPass) return alert("Confirm Password tidak cocok dengan Password");
    if (!name && !pass && !newAccountName) return alert("Isi minimal satu data untuk diupdate");

    try {
      if (name || pass) {
        await axios.put(`${API_URL}/customers/${customer.id}`, { name, password: pass });
      }
      
      if (newAccountName && selectedAccount) {
        await axios.put(`${API_URL}/accounts/${selectedAccount.id}`, { packet: newAccountName });
      }

      alert("Data Berhasil Diperbarui!");
      refreshData(customer.id);
      clearForms();
    } catch (err) { alert("Gagal update data"); }
  };

  const handleAddDeposito = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/depositos`, {
        name: newDepoName,
        yearly_return: parseFloat(newDepoReturn)
      });
      alert("Tipe Deposito Baru Berhasil Ditambahkan!");
      setNewDepoName('');
      setNewDepoReturn('');
      fetchAdminData();
    } catch (err) { alert("Gagal Menambah Deposito"); }
  };

  const handleSaveEditDeposito = async (id) => {
    try {
      await axios.put(`${API_URL}/depositos/${id}`, {
        name: editDepoName,
        yearly_return: parseFloat(editDepoReturn)
      });
      alert("Data Deposito Berhasil Diperbarui!");
      setEditingDepoId(null);
      fetchAdminData();
    } catch (err) { alert("Gagal Memperbarui Deposito"); }
  };

  if (view === 'HOME') return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', backgroundColor: bgLight }}>
      <h1 style={{ color: bgGreen, fontSize: '42px', marginBottom: '50px' }}>Selamat Datang di Belimbing Bank</h1>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '15px', border: `1px solid ${borderCol}`, minWidth: '300px' }}>
        <Btn label="Login" onClick={() => switchView('LOGIN')} />
        <Btn label="Register" onClick={() => switchView('REGISTER')} outline />
      </div>
      <Footer />
    </div>
  );

  if (view === 'LOGIN') return (
    <CenterBox title="Login Nasabah">
      {errorMsg && <p style={{ color: '#d93025', fontWeight: 'bold', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '6px' }}>{errorMsg}</p>}
      <form onSubmit={handleLogin}>
        <InputField label="Nama" type="text" val={name} setVal={setName} />
        <InputField label="Password" type="password" val={pass} setVal={setPass} />
        <Btn label="Login" type="submit" />
        <Btn label="Back" outline onClick={() => switchView('HOME')} />
      </form>
    </CenterBox>
  );

  if (view === 'REGISTER') return (
    <CenterBox title="Register Nasabah">
      {errorMsg && <p style={{ color: '#d93025', fontWeight: 'bold', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '6px' }}>{errorMsg}</p>}
      <form onSubmit={handleRegister}>
        <InputField label="Nama" type="text" val={name} setVal={setName} />
        <InputField label="Password" type="password" val={pass} setVal={setPass} />
        <InputField label="Confirm Password" type="password" val={confPass} setVal={setConfPass} />
        <InputField label="Nama Akun" type="text" val={accountName} setVal={setAccountName} />
        <SelectDeposito val={depositoId} setVal={setDepositoId} options={depositoTypes} />
        <Btn label="Register" type="submit" />
        <Btn label="Back" outline onClick={() => switchView('HOME')} />
      </form>
    </CenterBox>
  );

  if (view === 'SELECT_ACCOUNT') return (
    <CenterBox title="Pilih Akun">
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead><tr style={{ backgroundColor: bgGreen, color: 'white' }}><th style={{ padding: '12px' }}>Nama Nasabah</th><th>Paket</th><th>Saldo (Rp)</th><th>Aksi</th></tr></thead>
          <tbody>
            {accounts.length > 0 ? accounts.map(acc => (
              <tr 
                key={acc.id} 
                onClick={() => { setSelectedAccount(acc); setView('DASHBOARD'); }}
                style={{ borderBottom: `1px solid ${borderCol}`, cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f8f4'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <td style={{ padding: '12px' }}>{customer.name}</td>
                <td>{acc.packet} ({acc.deposito_type?.name})</td>
                <td style={{ fontWeight: 'bold' }}>{acc.balance}</td>
                <td>
                  <button 
                    onClick={(e) => handleDeleteAccount(e, acc.id)} 
                    style={{ padding: '8px 16px', backgroundColor: '#d93025', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            )) : <tr><td colSpan="4" style={{ padding: '20px' }}>Tidak ada akun</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ width: '100%', backgroundColor: '#f3f8f4', padding: '20px', borderRadius: '12px', border: `1px solid ${borderCol}`, marginBottom: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ color: bgGreen, marginTop: 0, fontSize: '18px' }}>Tambah Akun Baru</h3>
        <form onSubmit={handleCreateAccount} style={{ margin: '0 auto' }}>
          <InputField label="Nama Akun" type="text" val={accountName} setVal={setAccountName} />
          <SelectDeposito val={depositoId} setVal={setDepositoId} options={depositoTypes} />
          <Btn label="Tambah Akun" type="submit" />
        </form>
      </div>

      <Btn label="Kembali ke Layar Utama" outline onClick={() => { setCustomer(null); setAccounts([]); switchView('HOME'); }} />
    </CenterBox>
  );

  if (view === 'DASHBOARD') return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: bgLight, padding: '50px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <button onClick={() => setView('SELECT_ACCOUNT')} style={{ alignSelf: 'flex-start', marginBottom: '20px', padding: '10px 20px', backgroundColor: 'transparent', border: `1px solid ${bgGreen}`, color: bgGreen, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
        ← Kembali Pilih Akun
      </button>

      <div style={{ width: '700px', backgroundColor: 'white', padding: '30px', borderRadius: '15px', border: `1px solid ${borderCol}`, marginBottom: '30px' }}>
        <h3 style={{ textAlign: 'center', color: bgGreen, marginTop: 0 }}>Informasi Akun & Saldo</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead><tr style={{ backgroundColor: bgGreen, color: 'white' }}><th style={{ padding: '12px' }}>Nama Nasabah</th><th>Paket</th><th>Saldo (Rp)</th></tr></thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
              <td style={{ padding: '12px' }}>{customer.name}</td>
              <td>{selectedAccount?.packet} ({selectedAccount?.deposito_type?.name})</td>
              <td style={{ fontWeight: 'bold' }}>{selectedAccount?.balance}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ width: '700px', backgroundColor: '#f3f8f4', padding: '30px', borderRadius: '15px', border: `1px solid ${borderCol}`, marginBottom: '30px' }}>
        <h3 style={{ textAlign: 'center', color: bgGreen, marginTop: 0 }}>Transaksi (Setor / Tarik)</h3>
        <input type="number" placeholder="Nominal (Rp)" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => handleTransaction('setor')} style={{ flex: 1, padding: '14px', backgroundColor: bgGreen, color: 'white', borderRadius: '25px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Setor (Deposit)</button>
          <button onClick={() => handleTransaction('tarik')} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: bgGreen, borderRadius: '25px', border: `1px solid ${bgGreen}`, fontWeight: 'bold', cursor: 'pointer' }}>Tarik (Withdraw)</button>
        </div>
      </div>

      <div style={{ width: '700px', backgroundColor: 'white', padding: '30px', borderRadius: '15px', border: `1px solid ${borderCol}`, textAlign: 'center' }}>
        <h3 style={{ color: bgGreen, marginTop: 0 }}>Update Data Pribadi & Akun</h3>
        <form onSubmit={handleUpdate} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <InputField label="Nama Baru" type="text" val={name} setVal={setName} req={false} />
          <InputField label="Password Baru" type="password" val={pass} setVal={setPass} req={false} />
          <InputField label="Confirm Password Baru" type="password" val={confPass} setVal={setConfPass} req={false} />
          <InputField label="Nama Akun Baru" type="text" val={newAccountName} setVal={setNewAccountName} req={false} />
          <Btn label="Update Data" type="submit" />
        </form>
        
        <hr style={{ borderColor: borderCol, margin: '30px 0' }} />
        <button onClick={() => { setCustomer(null); setSelectedAccount(null); setAccounts([]); switchView('HOME'); }} style={{ padding: '12px 40px', backgroundColor: '#d93025', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      <Footer />
    </div>
  );

  if (view === 'ADMIN_DASHBOARD') return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: bgLight, padding: '50px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ color: bgGreen, marginBottom: '30px' }}>Dashboard SuperAdmin</h1>
      
      <div style={{ width: '800px', backgroundColor: 'white', padding: '30px', borderRadius: '15px', border: `1px solid ${borderCol}`, marginBottom: '30px' }}>
        <h3 style={{ textAlign: 'center', color: bgGreen, marginTop: 0 }}>Daftar Deposito (Master Data)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: bgGreen, color: 'white' }}>
              <th style={{ padding: '12px' }}>Nama Deposito</th>
              <th>Return Tahunan (%)</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {depositoTypes.map(depo => (
              <tr key={depo.id} style={{ borderBottom: `1px solid ${borderCol}` }}>
                <td style={{ padding: '12px' }}>
                  {editingDepoId === depo.id ? 
                    <input type="text" value={editDepoName} onChange={e => setEditDepoName(e.target.value)} style={{width: '90%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc'}}/> 
                    : depo.name}
                </td>
                <td>
                  {editingDepoId === depo.id ? 
                    <input type="number" step="any" value={editDepoReturn} onChange={e => setEditDepoReturn(e.target.value)} style={{width: '70%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc'}}/> 
                    : depo.yearly_return}
                </td>
                <td>
                  {editingDepoId === depo.id ? (
                    <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                      <button onClick={() => handleSaveEditDeposito(depo.id)} style={{ padding: '6px 12px', backgroundColor: bgGreen, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingDepoId(null)} style={{ padding: '6px 12px', backgroundColor: '#888', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingDepoId(depo.id); setEditDepoName(depo.name); setEditDepoReturn(depo.yearly_return); }} style={{ padding: '6px 16px', backgroundColor: '#f1c40f', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ width: '800px', backgroundColor: '#f3f8f4', padding: '30px', borderRadius: '15px', border: `1px solid ${borderCol}`, marginBottom: '30px', boxSizing: 'border-box' }}>
        <h3 style={{ textAlign: 'center', color: bgGreen, marginTop: 0 }}>Tambah Deposito Baru</h3>
        <form onSubmit={handleAddDeposito} style={{ margin: '0 auto' }}>
          <InputField label="Nama Deposito Baru" type="text" val={newDepoName} setVal={setNewDepoName} />
          <InputField label="Yearly Return (%)" type="number" step="any" val={newDepoReturn} setVal={setNewDepoReturn} />
          <Btn label="Tambah Data" type="submit" />
        </form>
      </div>

      <div style={{ width: '800px', backgroundColor: 'white', padding: '30px', borderRadius: '15px', border: `1px solid ${borderCol}`, marginBottom: '30px' }}>
        <h3 style={{ textAlign: 'center', color: bgGreen, marginTop: 0 }}>Daftar Seluruh Nasabah & Akun</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: bgGreen, color: 'white' }}>
              <th style={{ padding: '12px' }}>ID Nasabah</th>
              <th>Nama Nasabah</th>
              <th>Nama Akun (Paket)</th>
              <th>Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {allCustomers.filter(c => c.name !== 'SuperAdmin').map(cust => (
              cust.accounts && cust.accounts.length > 0 ? cust.accounts.map(acc => (
                <tr key={acc.id} style={{ borderBottom: `1px solid ${borderCol}` }}>
                  <td style={{ padding: '12px' }}>{cust.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{cust.name}</td>
                  <td>{acc.packet} ({acc.deposito_type?.name})</td>
                  <td>{acc.balance}</td>
                </tr>
              )) : (
                <tr key={`noacc-${cust.id}`} style={{ borderBottom: `1px solid ${borderCol}` }}>
                  <td style={{ padding: '12px' }}>{cust.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{cust.name}</td>
                  <td colSpan="2" style={{ fontStyle: 'italic', color: '#888' }}>Belum memiliki akun</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={() => { setCustomer(null); setAllCustomers([]); switchView('HOME'); }} style={{ padding: '12px 40px', backgroundColor: '#d93025', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Logout SuperAdmin</button>
      <Footer />
    </div>
  );
}