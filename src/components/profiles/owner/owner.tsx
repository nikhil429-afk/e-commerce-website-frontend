import { useEffect, useRef, useState } from "react";
import { getAllUsers, updateUser, deleteUser, getProducts, updateProduct, deleteProduct, getOrders, createProduct, getContacts, getAppointments, shipOrder } from "../../../api/owner";
import { LineChart, CartesianGrid, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getOrdersChart, getUsersChart } from "../../../api/charts";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getTokenPayload, clearToken } from "../../../utils/tokenUtils";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from "react-router-dom";
import styles from "./owner.module.css";
import dayjs from "dayjs";


type Tab = "stats" | "users" | "products" | "orders" | "contacts" | "appointments" | "settings";
type Modal = "editUser" | "delUser" | "addProduct" | "editProduct" | "delProduct" | null;

type OrderChart = { label: string; value: number };
type UserChart = { label: string; value: number };

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  images: (string | File)[];
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  tag: string;
  description: string;
  in_stock: boolean;
}

interface Order {
  id: number;
  user_name: string;
  userEmail: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  in_stock: boolean;
  status: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: number;
  subject: string;
  message: string;
}

interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: number;
  message: string;
  appointment_date: string;
}


type FieldProps = { label: string; children: React.ReactNode };

const F = ({ label, children }: FieldProps) => (
  <div className={styles.field}>
    <label className={styles.fieldLabel}>{label}</label> <div className={styles.fieldInput}>{children}</div>
  </div>
);

const BLANK_PROD = { name: "", images: [] as File[], category: "", price: 0, oldPrice: 0, rating: 0, tag: "", description: "", in_stock: true };
const BLANK_USER = { username: "", email: "", password: "", role: "user" };

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "stats", icon: "📊", label: "Statistics" },
  { id: "products", icon: "📦", label: "Products" },
  { id: "orders", icon: "📋", label: "Orders" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "contacts", icon: "📡", label: "Contacts"},
  { id: "appointments", icon: "🗓️", label: "Appointments" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const defaultEnd = dayjs();
const defaultStart = defaultEnd.subtract(30, "day");

function Owner() {
  const navigate = useNavigate();
  const owner = getTokenPayload();
  const profileRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>("stats");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([defaultStart, defaultEnd,]);
  
  const [activeChart, setActiveChart] = useState<"orders" | "users" | "visitors">("users");
  const [ordersData, setOrdersData] = useState<OrderChart[]>([]);
  const [usersData, setUsersData] = useState<UserChart[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [visitorData, setVisitorData] = useState<{ label: string; value: number }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [selUser, setSelUser] = useState<User | null>(null);
  const [selProd, setSelProd] = useState<Product | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [uForm, setUForm] = useState({ ...BLANK_USER });
  const [pForm, setPForm] = useState({ ...BLANK_PROD });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [errU, setErrU] = useState("");
  const [errP, setErrP] = useState("");
  const [errO, setErrO] = useState("");
  const [errC, setErrC] = useState("");
  const [errA, setErrA] = useState("");
  const [errT, setErrT] = useState("");
  
  const chartTotal = ordersData.reduce((s, d) => s + Number(d.value || 0), 0);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (owner && owner.role !== "owner") navigate("/");
  }, [owner]);

  useEffect(() => {
    const defaultEnd = dayjs();
    const defaultStart = defaultEnd.subtract(19, "day");
    loadChartData(defaultStart, defaultEnd); fetchAppointments(); fetchContactUs(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchUsers = async () => {
    setErrU("");
    try   { setUsers(await getAllUsers()); }
    catch (e: any) { setErrU(e.message ?? "Failed to load Users"); }
  };

  const loadChartData = async (startDate: any, endDate: any) => {
    setErrT("");
    const start = startDate.toDate ? startDate.toDate().toISOString() : startDate.toISOString();
    const end = endDate.toDate ? endDate.toDate().toISOString() : endDate.toISOString();

    try {
      const ordersRes = await getOrdersChart(start, end);
      setOrdersData(Array.isArray(ordersRes) ? ordersRes : []);
    } catch {
      setOrdersData([]);
    }
    try {
      const usersRes = await getUsersChart(start, end);
      setUsersData(Array.isArray(usersRes) ? usersRes : []);
    } catch {
      setUsersData([]);
    }
  };

  const fetchProducts = async () => {
    setErrP("");
    try { setProducts(await getProducts()); }
    catch (e: any) { setErrP(e.message ?? "Failed to load Products!"); }
  };

  const fetchOrders = async () => {
    setErrO("");
    try { setOrders(await getOrders()); }
    catch (e: any) { setErrO(e.message ?? "Failed to load Orders!"); }
  };

  const fetchContactUs = async () => {
    setErrC("");
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (e: any) {
      setErrC(e.message ?? "Failed to load Contacts");
    };
  };

  const fetchAppointments = async () => {
    setErrA("");
    try {
    const data = await (getAppointments());
    setAppointments(data);
  } catch (e: any) {
    setErrA(e.message ?? "Failed to Load Appointments");
  }
};

  useEffect(() => { fetchUsers(); fetchProducts(); fetchOrders(); }, []);
  const close = () => { setModal(null); setSaving(false); };

  const openEditUser = (u: User) => {
    setSelUser(u);
    setUForm({ username: u.username, email: u.email ?? "", password: "", role: u.role });
    setModal("editUser");
  };
  const openDelUser  = (u: User) => { setSelUser(u); setModal("delUser"); };
  const openAddProd  = () => { setPForm({ ...BLANK_PROD }); setModal("addProduct"); };
  const openEditProd = (p: Product) => {
    setSelProd(p);
    setPForm({ name: p.name, images: [], category: p.category, price: p.price, oldPrice: p.oldPrice, rating: p.rating, tag: p.tag, description: p.description, in_stock: p.in_stock, });
    setModal("editProduct");
  };
  const openDelProd = (p: Product) => { setSelProd(p); setModal("delProduct"); };

  const submitEditUser = async () => {
    if (!selUser) return;
    setSaving(true);
    try {
      const updated = await updateUser(selUser.id, { username: uForm.username.trim() || undefined, role: uForm.role || undefined });
      setUsers(prev => prev.map(u => u.id === selUser.id ? { ...u, ...updated } : u));
      close(); showToast("User updated");
    } catch (e: any) { showToast(e.message ?? "Failed to update user", false); }
    finally { setSaving(false); }
  };

  const submitDelUser = async () => {
    if (!selUser) return;
    setSaving(true);
    try {
      await deleteUser(selUser.id);
      setUsers(prev => prev.filter(u => u.id !== selUser.id));
      close(); showToast("User deleted");
    } catch (e: any) { showToast(e.message ?? "Failed to delete user", false); }
    finally { setSaving(false); }
  };

  const submitAddProd = async () => {
    if (!pForm.name.trim() || !pForm.category.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();

      formData.append("name", pForm.name.trim());
      formData.append("category", pForm.category.trim());
      formData.append("price", String(pForm.price));
      formData.append("oldPrice", String(pForm.oldPrice));
      formData.append("rating", String(pForm.rating));
      formData.append("tag", pForm.tag.trim());
      formData.append("description", pForm.description.trim());
      formData.append("in_stock", String(pForm.in_stock));

      pForm.images.forEach((img) => {
        formData.append("images", img);
      });
      const res = await createProduct(formData);
      if (res.detail) { throw new Error(res.detail); }
      setProducts(prev => [...prev, res.product]);
      close();
      showToast("Product added");
    } catch (e: any) {
      showToast(e.message ?? "Failed to add product", false);
    } finally {
      setSaving(false);
    }
  };

  const submitEditProd = async () => {
    if (!selProd) return;
    setSaving(true);
    try {
      const formData = new FormData();

      formData.append("name", pForm.name.trim());
      formData.append("category", pForm.category.trim());
      formData.append("price", String(pForm.price));
      formData.append("oldPrice", String(pForm.oldPrice));
      formData.append("rating", String(pForm.rating));
      formData.append("tag", pForm.tag.trim());
      formData.append("description", pForm.description.trim());
      formData.append("in_stock", String(pForm.in_stock));
      
      pForm.images.forEach((img) => {
        formData.append("images", img);
      });
      const updated = await updateProduct(selProd.id, formData);
      setProducts(prev => prev.map(p => p.id === selProd.id ? { ...p, ...updated } : p));
      close();
      showToast("Product updated");
    } catch (e: any) {
      showToast(e.message ?? "Failed to update product", false);
    } finally {
      setSaving(false);
    }
  };


  const toggleStock = async (p: Product) => {
    const next = !p.in_stock;
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, in_stock: next } : x));
    try {
      const formData = new FormData();

      formData.append("name", p.name);
      formData.append("category", p.category);
      formData.append("price", String(p.price));
      formData.append("oldPrice", String(p.oldPrice));
      formData.append("rating", String(p.rating));
      formData.append("tag", p.tag);
      formData.append("description", p.description);
      formData.append("in_stock", String(next));

      await updateProduct(p.id, formData);
      showToast(`Stock set to ${ next ? "In Stock" : "Out of Stock"}`);
    } catch (e: any) {
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, in_stock: !next } : x));
      showToast(e.message ?? "Failed to toggle stock", false);
    }
  };

  const handleShipped = async (o: Order) => {
    const next = o.status === "pending" ? "shipped" : "pending";
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: next } : x));
    try {
      await shipOrder(o.id);
      showToast(`Order marked as ${ next === "shipped" ? "Shipped" : "Pending"}`);
    } catch (e: any) {
      setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: o.status } : x));
      showToast(e.message ?? "Failed to update order status", false);
    }
  };
  
  const submitDelProd = async () => {
    if (!selProd) return;
    setSaving(true);
    try {
      await deleteProduct(selProd.id);
      setProducts(prev => prev.filter(p => p.id !== selProd.id));
      close(); showToast("Product deleted");
    } catch (e: any) { showToast(e.message ?? "Failed to delete product", false); }
    finally { setSaving(false); }
  };

  const confirmLogout = () => { clearToken(); setShowLogoutModal(false); navigate('/login'); };

  const q  = search.toLowerCase();
  const FU = users.filter(u => !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q));
  const FP = products.filter(p => !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q));
  const FO = orders.filter(o => !q || String(o.id).includes(q) || o.name?.toLowerCase().includes(q) || o.category?.toLowerCase().includes(q) || o.status?.toLowerCase().includes(q));
  const FC = contacts.filter(c => !q || String(c.id).includes(q) || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q));
  const FA = appointments.filter(a => !q || String(a.id).includes(q) || a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.message?.toLowerCase().includes(q) || a.appointment_date?.toLowerCase().includes(q));

  const ErrBanner = ({ msg, retry }: { msg: string; retry: () => void }) => (
    <div className={styles.error}> {msg}
      <button className={styles.retryBtn} onClick={retry}>Retry</button>
    </div>
  );

  const EmptyRow = ({ icon, title, sub }: { icon: string; title: string; sub: string }) => (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>{icon}</div>
      <div className={styles.emptyStateTitle}>{title}</div>
      <div className={styles.emptyStateSub}>{sub}</div>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>F</div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Furniture · Co</span>
            <span className={styles.logoSub}>Owner Panel</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map(item => (
              <li key={item.id} className={`${styles.navItem} ${tab === item.id ? styles.active : ""}`}
              onClick={() => { setTab(item.id); setSearch(""); }}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {tab === item.id && <span className={styles.navIndicator} />}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.profileArea} ref={profileRef}>
          {profileOpen && (
            <div className={`${styles.profileMenu} ${styles.profileMenuVisible}`}>
              <div className={styles.profileMenuInfo}>
                <span className={styles.profileMenuName}>{owner?.username ?? "Owner"}</span>
                <span className={styles.profileMenuRole}>Owner · Administrator</span>
              </div>
            </div>
          )}
          <button className={`${styles.profileBtn} ${profileOpen ? styles.profileBtnActive : ""}`}
            onClick={() => setProfileOpen(o => !o)}>
            <div className={styles.profileAvatar}>{owner?.username?.slice(0, 2)?.toUpperCase() ?? "OW"}</div>
            <div className={styles.profileBtnText}>
              <span className={styles.profileBtnName}>{owner?.username ?? "Owner"}</span>
              <span className={styles.profileBtnSub}>Administrator</span>
            </div>
            <span className={`${styles.profileChevron} ${profileOpen ? styles.profileChevronUp : ""}`}>›</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>
              {tab === "stats" ? "Statistics" : tab === "users" ? "Users" : tab === "products" ? "Products" : tab === "orders" ? "Orders"
               : tab === "contacts" ? "Contacts" : tab === "appointments" ? "Appointments" : "Settings"}
            </h1>
            <p className={styles.headerSub}>
              {tab === "stats" && `Overview of your store's performance and activity`}
              {tab === "products" && `${products.length} products · ${products.filter(p => p.in_stock).length} in stock`}
              {tab === "orders" && `${orders.length} total · ${orders.filter(o => o.status === "pending").length} pending`}
              {tab === "contacts" && `Total of ${contacts.length} Contacts, trying to Reach you `}
              {tab === "appointments" && `Manage your appointments and bookings Here`}
              {tab === "users" && `${users.length} Registered Accounts`}
              {tab === "settings" && `Configure your Store Settings & Preferences`}
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchWrap}>
              <input className={styles.search} placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.statCards}>
          {[
            { cls: styles.statCardUsers, icon: "👥", label: "New Users", val: users.length },
            { cls: styles.statCardTotalOrders, icon: "📦", label: "Total Orders", val: orders.length },
            { cls: styles.statCardNewOrders, icon: "⏰", label: "New Orders", val: orders.filter(o => o.status === "pending").length },
            { cls: styles.statCardVisitors, icon: "👀", label: "New Visitors", val: visitorData.reduce((s, d) => s + d.value, 0) },
          ].map((s, i) => (
            <div key={i} className={`${styles.statCard} ${s.cls}`}>
              <div className={styles.statCardIcon}>{s.icon}</div>
              <div className={styles.statCardBody}>
                <span className={styles.statCardLabel}>{s.label}</span>
                <span className={styles.statCardValue}>{s.val}</span>
              </div>
            </div>
          ))}
        </div>

        {tab === "stats" && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionPanelHeader}>
              <div className={styles.statsHeaderRow}>
                <div className={styles.statsHeaderLeft}>
                  <div className={styles.statsChartToggle}>
                    {(["users","orders"] as const).map(t => (
                      <button key={t} onClick={() => setActiveChart(t)}
                        className={`${styles.chartToggleBtn} ${activeChart === t ? styles.chartToggleBtnActive : ""}`}>
                        {t === "users" ? "Users" : "Orders"}
                      </button>
                    ))}
                  </div>
                  <div className={styles.sectionPanelTitle}>Statistics</div>
                  <div className={styles.sectionPanelSub}>See Everything About Your Website</div>
                </div>
                <div className={styles.statsDateCenter}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className={styles.datePickers}>
                      <DatePicker label="Start Date" minDate={dateRange[1] ? dayjs(dateRange[1]).subtract(31, "day") : undefined}
                        maxDate={dateRange[1] || dayjs()} value={dateRange[0]} onChange={(newStart) => { const updated: [any, any] = [newStart, dateRange[1]];
                        setDateRange(updated);

                        if (updated[0] && updated[1]) { loadChartData(updated[0], updated[1]); }}}/>
                      <DatePicker label="End Date" value={dateRange[1]} maxDate={dayjs()} minDate={dateRange[0] ?? undefined}
                        onChange={(newEnd) => { const updated: [any, any] = [dateRange[0], newEnd]; setDateRange(updated);
                        
                        if (updated[0] && updated[1]) { loadChartData(updated[0], updated[1]); }}}/>
                    </div>
                  </LocalizationProvider>
                </div>
              </div>
            </div>
            <div className={styles.statsChartBody}>
                {activeChart === "orders" && (<>
                {errT ? <ErrBanner msg={errT} retry={() => {if (dateRange[0] && dateRange[1]) {loadChartData(dateRange[0], dateRange[1]);}}} /> : ordersData.length === 0
                  ? <EmptyRow icon="📦" title={search ? "No Charts" : "No Charts"} sub={search ? `Nothing matches "${search}"` : "No accounts found."} />
                  : (<>
                <div className={styles.cardSub}>Total Orders in past 30 Days</div>
                <div className={styles.chartWrap}>
                  {ordersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ordersData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <defs><linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="purple"/><stop offset="100%" stopColor="cyan"/></linearGradient></defs>
                        <CartesianGrid stroke="rgba(0,0,0,0.04)" />
                        <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: "#3470d6", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#25b6f9", strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className={styles.chartEmpty}>Loading Chart....</div>}
                </div><br />
                <div className={styles.barFooter}>
                  <div><div className={styles.barTotal}>{chartTotal}</div><div className={styles.barTotalLabel}>Total Orders In Past 30 Days</div></div>
                  <div className={styles.barGrowth}>{ordersData.reduce((sum, item) => sum + Number(item.value || 0), 0)} Orders</div>
                </div>
                </>)}
              </>)}
              
              {activeChart === "users" && (<>
                {errT ? <ErrBanner msg={errT} retry={() => {if (dateRange[0] && dateRange[1]) {loadChartData(dateRange[0], dateRange[1]);}}} /> : usersData.length === 0
                  ? <EmptyRow icon="👥" title={search ? "No Charts" : "No Charts"} sub={search ? `Nothing matches "${search}"` : "No accounts found."} />
                  : (<>
                <div className={styles.cardSub}>Total Users Registered in past 30 Days</div>
                <div className={styles.chartWrap}>
                  {usersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usersData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <defs><linearGradient id="convGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#6e14ec"/></linearGradient></defs>
                        <CartesianGrid stroke="rgba(0,0,0,0.04)" />
                        <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip  />
                        <Line type="monotone" dataKey="value" stroke="url(#convGrad)" strokeWidth={2.5} dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className={styles.chartEmpty}>Loading Chart....</div>}
                </div><br />
                <div className={styles.barFooter}>
                  <div className={styles.barTotalLabel}>Registered Users (30 Days)</div>
                  <div className={styles.barGrowth}>{usersData.reduce((sum, item) => sum + Number(item.value || 0), 0)} Users</div>
                </div>
              </>)}
              </>)}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionPanelHeader}>
              <div>
                <div className={styles.sectionPanelTitle}>All Users</div>
                <div className={styles.sectionPanelSub}>View, edit and remove registered accounts</div>
              </div>
              <div className={styles.sectionStatusPill}> {FU.length} User(s) </div>
            </div>

            {errU ? <ErrBanner msg={errU} retry={fetchUsers} /> : FU.length === 0
              ? <EmptyRow icon="👥" title={search ? "No results" : "No users yet"} sub={search ? `Nothing matches "${search}"` : "No accounts found."} />
              : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th> <th>User</th> <th>Email</th> <th>Role</th> <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(FU || []).map((u) => (
                        <tr key={u?.id} className={styles.tableRow}>
                          <td className={styles.indexCell}>{u?.id}</td>
                          <td>
                            <div className={styles.userCell}>
                              <span className={styles.userName}>{u?.username}</span>
                            </div>
                          </td>
                          <td className={styles.emailText}>{u?.email || "—"}</td>
                          <td>
                            <span className={`${styles.role} ${u?.role === "owner" ? styles.owner : styles.user}`}>{u?.role}</span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button className={styles.editBtn} onClick={() => openEditUser(u)}>Edit</button>
                              <button className={styles.deleteBtn} onClick={() => openDelUser(u)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {tab === "products" && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionPanelHeader}>
              <div>
                <div className={styles.sectionPanelTitle}>Product Catalogue</div>
                <div className={styles.sectionPanelSub}>Add, edit, remove products and toggle stock status</div>
              </div>
                <button className={styles.addBtn} onClick={openAddProd}>+ Add Product</button>
              <div className={styles.sectionPanelActions}>
                <div className={styles.sectionStatusPill}>{FP.length} product(s)</div>
              </div>
            </div>

            {errP ? <ErrBanner msg={errP} retry={fetchProducts} /> : FP.length === 0
              ? <EmptyRow icon="📦" title={search ? "No results" : "No products yet"} sub={search ? `Nothing matches "${search}"` : "Add your first product using the button above."} />
              : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th> <th>Product</th> <th>Category</th> <th>Price</th> <th>Old Price</th> <th>Rating</th> <th>Tag</th> <th>Stock</th>
                        <th>Description</th> <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(FP || []).map((p) => (
                        <tr key={p?.id} className={styles.tableRow}>
                          <td className={styles.indexCell}>{p?.id}</td>
                          <td><div className={styles.productCell}>{p?.name}</div></td>
                          <td className={styles.categoryText}>{p?.category}</td>
                          <td><span className={styles.priceNew}>${p?.price}</span></td>
                          <td><del>${p?.oldPrice}</del></td>
                          <td>{p?.rating} / 5</td>
                          <td>{p?.tag}</td>
                          <td><span className={styles.descCell}>({p?.description})</span></td>
                          <td>
                            <button onClick={() => toggleStock(p)}
                              className={`${styles.stockToggle} ${p?.in_stock ? styles.stockToggleOn : styles.stockToggleOff}`}>
                              <span className={styles.stockLabel}>{p?.in_stock ? "In Stock" : "Out of Stock"}</span>
                            </button>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button className={styles.editBtn} onClick={() => openEditProd(p)}>Edit</button>
                              <button className={styles.deleteBtn} onClick={() => openDelProd(p)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {tab === "orders" && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionPanelHeader}>
              <div>
                <div className={styles.sectionPanelTitle}>Orders</div>
                <div className={styles.sectionPanelSub}>Track and fulfil customer orders</div>
              </div>
              <div className={styles.sectionStatusPill}>
                {orders.filter(o => o.status === "pending").length} pending
              </div>
            </div>

            {errO ? <ErrBanner msg={errO} retry={fetchOrders} /> : FO.length === 0
              ? <EmptyRow icon="📦" title={search ? "No results" : "No orders yet"} sub={search ? `Nothing matches "${search}"` : "Orders will appear here when customers buy."} />
              : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Order</th> <th>Customer Name</th> <th>Customer Email</th> <th>Product</th> <th>Category</th> <th>Qty</th> <th>Total($)</th> <th>Status</th> <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(FO || []).map((o) => (
                        <tr key={o?.id} className={styles.tableRow}>
                          <td className={styles.indexCell}>{o?.id}</td>
                          <td className={styles.orderName}>{o?.user_name}</td>
                          <td className={styles.orderName}>{o?.userEmail}</td>
                          <td className={styles.orderName}>{o?.name}</td>
                          <td className={styles.categoryText}>{o?.category}</td>
                          <td className={styles.categoryText}>{o?.quantity}</td>
                          <td className={styles.priceNew}>{o?.price*o?.quantity}</td>
                          <td>{o?.status === "shipped" ? <span className={styles.orderStatusDelivered}>✓ Shipped</span>
                              : <span className={styles.orderStatusPending}>⏳ Pending</span>}
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button className={styles.editBtn} onClick={() => handleShipped(o)}>Change Status</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {tab === "contacts" && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionPanelHeader}>
              <div>
                <div className={styles.sectionPanelTitle}>Contacts</div>
                <div className={styles.sectionPanelSub}>Know about your Customer's Complains, Feedbacks, etc</div>
              </div>
              <div className={styles.sectionStatusPill}>{FC.length} Contact(s)</div>
            </div>

            {errC ? <ErrBanner msg={errC} retry={fetchContactUs} /> : FA.length === 0
              ? <EmptyRow icon="📡" title={search ? "No results" : "No Contacts Yet"} sub={search ? `Nothing matches "${search}"` : "Contacts will Appear Here When Customers Try to Contact You."} />
              : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th> <th>Name</th> <th>Email</th> <th>Phone Number</th> <th>Subject</th> <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(FC || []).map((c) => (
                        <tr key={c?.id} className={styles.tableRow}>
                          <td className={styles.indexCell}>{c?.id}</td>
                          <td className={styles.orderName}>{c?.name}</td>
                          <td className={styles.categoryText}>{c?.email}</td>
                          <td className={styles.categoryText}>{c?.phone}</td>
                          <td className={styles.priceNew}>{c?.subject}</td>
                          <td className={styles.message}>{c?.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {tab === "appointments" && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionPanelHeader}>
              <div>
                <div className={styles.sectionPanelTitle}>Appointments</div>
                <div className={styles.sectionPanelSub}>Know When your Customers want to Visit You!</div>
              </div>
              <div className={styles.sectionStatusPill}>{FA.length} Appointment(s)</div>
            </div>

            {errA ? <ErrBanner msg={errA} retry={fetchAppointments} /> : FA.length === 0
              ? <EmptyRow icon="🗓️" title={search ? "No results" : "No Appointments Yet"} sub={search ? `Nothing matches "${search}"` : "Appointments will Appear Here When Customers Wants Visit the Showroom."} />
              : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th> <th>Name</th> <th>Email</th> <th>Number</th> <th>Message</th> <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(FA || []).map((a) => (
                        <tr key={a?.id} className={styles.tableRow}>
                          <td className={styles.indexCell}>{a?.id}</td>
                          <td className={styles.orderName}>{a?.name}</td>
                          <td className={styles.categoryText}>{a?.email}</td>
                          <td className={styles.categoryText}>{a?.phone}</td>
                          <td className={styles.message}>{a?.message}</td>
                          <td className={styles.priceNew}>{a?.appointment_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {tab === "settings" && (
          <div className={styles.sectionPanel}>
            <div className={styles.sectionPanelHeader}>
              <div>
                <div className={styles.sectionPanelTitle}>Settings</div>
                <div className={styles.sectionPanelSub}>Customize your Profile, Preferences, etc.</div>
              </div>
              <div className={styles.sectionStatusPill}>Settings</div>
            </div>
            <div className={styles.preferences}>
            </div>
            <div className={styles.button}>
              
            </div>
            <div className={styles.section}></div>
          </div>
        )}
      </main>

      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
          {toast.msg}
        </div>
      )}

      {modal === "editUser" && selUser && (
        <div className={styles.modalOverlay} onClick={close}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Edit User</span>
              <button className={styles.modalClose} onClick={close}>✕</button>
            </div>
            <p className={styles.modalDesc}>
              Editing <strong className={styles.modalStrong}>{selUser.username}</strong> — ID #{selUser.id}
            </p>
            <div className={styles.modalForm}>
              <F label="Username">
                <input className={styles.input} value={uForm.username} onChange={e => setUForm(f => ({ ...f, username: e.target.value }))} />
              </F>
              <F label="Role">
                <select className={styles.input} value={uForm.role} onChange={e => setUForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </F>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={close} disabled={saving}>Cancel</button>
              <button className={styles.btnPrimary}   onClick={submitEditUser} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {modal === "delUser" && selUser && (
        <div className={styles.modalOverlay} onClick={close}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.logoutModalIcon} />
            <div className={styles.modalHeaderCenter}>
              <span className={styles.modalTitle}>Delete User?</span>
            </div>
            <p className={styles.modalDescCenter}>
              Permanently remove <strong className={styles.modalStrong}>{selUser.username}</strong>. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn}  onClick={close} disabled={saving}>Cancel</button>
              <button className={styles.confirmBtn} onClick={submitDelUser} disabled={saving}>{saving ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {modal === "addProduct" && (
        <div className={styles.modalOverlay} onClick={close}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Add New Product</span>
              <button className={styles.modalClose} onClick={close}>✕</button>
            </div>
            <p className={styles.modalDesc}>All fields below map directly to database columns.</p>
            <div className={styles.modalForm}>
              <F label="Name">
                <input className={styles.input} placeholder="Enter Name of the Product" value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} />
              </F>
              <div className={styles.inputRow}>
              <F label="Category">
                <select className={styles.input} value={pForm.category} onChange={e => setPForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="" disabled>Select Category</option>
                  <option value="sofas">Sofas</option>
                  <option value="beds">Beds</option>
                  <option value="tables">Tables</option>
                  <option value="chairs">Chairs</option>
                  <option value="almirahs">Almirahs</option>
                  <option value="dinings">Dinings</option>
                </select>
              </F>
              <F label="Rating">
                <select className={styles.input} value={pForm.rating} onChange={e => setPForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                  <option value="" disabled>Select Rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </F>
              </div>
              <div className={styles.inputRow}>
                <F label="Price ($)">
                  <input className={styles.input} type="number" min={0} placeholder="0" value={pForm.price || ""} onChange={e => setPForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </F>
                <F label="Old Price ($)">
                  <input className={styles.input} type="number" min={0} placeholder="0" value={pForm.oldPrice || ""} onChange={e => setPForm(f => ({ ...f, oldPrice: Number(e.target.value) }))} />
                </F>
              </div>
              <F label="Upload Image">
                <input type="file" accept="image/*" multiple className={styles.input} onChange={(e) => setPForm((f) => ({ ...f, images: e.target.files ? [...f.images, ...Array.from(e.target.files)] : f.images, }))}/>
              </F>
              <div className={styles.inputRow}>
              <F label="Tag">
                <select className={styles.input} value={pForm.tag} onChange={e => setPForm(f => ({ ...f, tag: e.target.value }))}>
                  <option value="" disabled>Select a tag</option>
                  <option value="new">New</option>
                  <option value="sale">On Sale</option>
                  <option value="popular">Popular</option>
                  <option value="trending">Trending</option>
                </select>
              </F>
              <F label="Stock Status">
                <select className={styles.input} value={pForm.in_stock ? "true" : "false"} onChange={e => setPForm(f => ({ ...f, in_stock: e.target.value === "true" }))}>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </F>
              </div>
              <F label="Description">
                <textarea className={`${styles.input} ${styles.textarea}`} rows={3} placeholder="Brief product description…" value={pForm.description} onChange={e => setPForm(f => ({ ...f, description: e.target.value }))} />
              </F>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={close} disabled={saving}>Cancel</button>
              <button className={styles.btnPrimary} onClick={submitAddProd} disabled={saving}>{saving ? "Adding..." : "Add Product"}</button>
            </div>
          </div>
        </div>
      )}

      {modal === "editProduct" && selProd && (
        <div className={styles.modalOverlay} onClick={close}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Edit Product</span>
              <button className={styles.modalClose} onClick={close}>✕</button>
            </div>
            <p className={styles.modalDesc}>
              Editing <strong className={styles.modalStrong}>{selProd.name}</strong> — ID #{selProd.id}
            </p>
            <div className={styles.modalForm}>
              <F label="Name">
                <input className={styles.input} value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} />
              </F>
              <div className={styles.inputRow}>
              <F label="Category">
                <select className={styles.input} value={pForm.category} onChange={e => setPForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="sofas">Sofas</option>
                  <option value="beds">Beds</option>
                  <option value="tables">Tables</option>
                  <option value="chairs">Chairs</option>
                  <option value="almirahs">Almirahs</option>
                  <option value="dinings">Dinings</option>
                </select>
              </F>
              <F label="Rating">
                <select className={styles.input} value={pForm.rating} onChange={e => setPForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                  <option value="" disabled>Select Rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </F>
              </div>
              <div className={styles.inputRow}>
                <F label="Price ($)">
                  <input className={styles.input} type="number" min={0} value={pForm.price} onChange={e => setPForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </F>
                <F label="Old Price ($)">
                  <input className={styles.input} type="number" min={0} value={pForm.oldPrice} onChange={e => setPForm(f => ({ ...f, oldPrice: Number(e.target.value) }))} />
                </F>
              </div>
              <F label="Upload Image">
                <input type="file" multiple accept="image/*" className={styles.input} onChange={(e) => setPForm((f) => ({ ...f, images: e.target.files ? [...f.images, ...Array.from(e.target.files)] : f.images,  }))} />
              </F>
              <div className={styles.inputRow}>
              <F label="Tag">
                <select className={styles.input} value={pForm.tag} onChange={e => setPForm(f => ({ ...f, tag: e.target.value }))}>
                  <option value="" disabled>Select a tag</option>
                  <option value="new">New</option>
                  <option value="sale">On Sale</option>
                  <option value="popular">Popular</option>
                  <option value="trending">Trending</option>
                </select>
              </F>
              <F label="Stock Status">
                <select className={styles.input} value={pForm.in_stock ? "true" : "false"} onChange={e => setPForm(f => ({ ...f, in_stock: e.target.value === "true" }))}>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </F>
              </div>
              <F label="Description">
                <textarea className={`${styles.input} ${styles.textarea}`} rows={3} value={pForm.description} onChange={e => setPForm(f => ({ ...f, description: e.target.value }))} />
              </F>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={close} disabled={saving}>Cancel</button>
              <button className={styles.btnPrimary} onClick={submitEditProd} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {modal === "delProduct" && selProd && (
        <div className={styles.modalOverlay} onClick={close}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.logoutModalIcon} />
            <div className={styles.modalHeaderCenter}>
              <span className={styles.modalTitle}>Delete Product?</span>
            </div>
            <p className={styles.modalDescCenter}>
              Permanently remove <strong className={styles.modalStrong}>{selProd.name}</strong> from the catalogue. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={close} disabled={saving}>Cancel</button>
              <button className={styles.confirmBtn} onClick={submitDelProd} disabled={saving}>{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', marginBottom: 8 }}>Sign Out?</p>
            <p style={{ fontSize: '0.82rem', opacity: 0.7, marginBottom: 0 }}>{owner?.username}</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>No, Cancel</button>
              <button className={styles.confirmBtn} onClick={confirmLogout}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Owner;
