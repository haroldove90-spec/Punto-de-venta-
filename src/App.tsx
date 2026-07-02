import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Receipt, 
  DollarSign, 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  X, 
  XCircle, 
  Clock, 
  CreditCard, 
  User, 
  ShoppingBag, 
  History, 
  Printer, 
  Info, 
  FileText,
  Activity,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface Product {
  id: string;
  name: string;
  genericName: string;
  price: number;
  category: string;
  requiresPrescription: boolean;
  stock: number;
  presentation: string;
  imageUrl: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface SaleRecord {
  id: string;
  timestamp: Date;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  cashReceived: number;
  change: number;
  ticketNumber: string;
}

// Catálogo de Productos de Alta Rotación
const PRODUCTS: Product[] = [
  { id: '1', name: 'Paracetamol', genericName: 'Tempra / Analgésico 500mg', price: 20, category: 'Analgésicos', requiresPrescription: false, stock: 120, presentation: 'Caja con 20 tabletas', imageUrl: 'https://appdesign.appdesignproyectos.com/paracetamol.jpg' },
  { id: '2', name: 'Ibuprofeno', genericName: 'Advil / Antiinflamatorio 400mg', price: 35, category: 'Analgésicos', requiresPrescription: false, stock: 85, presentation: 'Caja con 10 cápsulas', imageUrl: 'https://appdesign.appdesignproyectos.com/ibuprofeno.jpg' },
  { id: '3', name: 'Alcohol en Gel', genericName: 'Antiséptico antibacterial 70%', price: 45, category: 'Antisépticos', requiresPrescription: false, stock: 50, presentation: 'Frasco con 250ml', imageUrl: 'https://appdesign.appdesignproyectos.com/alcohol.jpg' },
  { id: '4', name: 'Gasas Estériles', genericName: 'Material de curación 10x10cm', price: 15, category: 'Curación', requiresPrescription: false, stock: 200, presentation: 'Paquete con 10 piezas', imageUrl: 'https://appdesign.appdesignproyectos.com/gasas.webp' },
  { id: '5', name: 'Amoxicilina', genericName: 'Amoxil / Antibiótico 500mg', price: 85, category: 'Antibióticos', requiresPrescription: true, stock: 40, presentation: 'Caja con 12 cápsulas', imageUrl: 'https://appdesign.appdesignproyectos.com/amoxcicilina.jpg' },
  { id: '6', name: 'Omeprazol', genericName: 'Inhibidor gástrico 20mg', price: 30, category: 'Gastrointestinal', requiresPrescription: false, stock: 150, presentation: 'Caja con 14 cápsulas', imageUrl: 'https://appdesign.appdesignproyectos.com/omeprazol.jpg' },
  { id: '7', name: 'Loratadina', genericName: 'Claritin / Antihistamínico 10mg', price: 25, category: 'Alergias', requiresPrescription: false, stock: 95, presentation: 'Caja con 10 tabletas', imageUrl: 'https://appdesign.appdesignproyectos.com/loratalina.jpg' },
  { id: '8', name: 'Vitamina C', genericName: 'Redoxon / Tab. Masticables', price: 60, category: 'Suplementos', requiresPrescription: false, stock: 70, presentation: 'Frasco con 30 tabletas', imageUrl: 'https://appdesign.appdesignproyectos.com/vitaminac.jpg' },
  { id: '9', name: 'Naproxeno', genericName: 'Flanax / Analgésico 250mg', price: 40, category: 'Analgésicos', requiresPrescription: false, stock: 110, presentation: 'Caja con 12 tabletas', imageUrl: 'https://appdesign.appdesignproyectos.com/naproxeno.jpg' },
  { id: '10', name: 'Jeringa Desechable', genericName: 'Material de curación 5ml con aguja', price: 12, category: 'Curación', requiresPrescription: false, stock: 300, presentation: 'Unidad de 5ml', imageUrl: 'https://appdesign.appdesignproyectos.com/jeringas.jpg' },
  { id: '11', name: 'Alcohol Etílico', genericName: 'Desinfectante de heridas 96°', price: 38, category: 'Antisépticos', requiresPrescription: false, stock: 65, presentation: 'Botella de 500ml', imageUrl: 'https://appdesign.appdesignproyectos.com/alcoholetilico.jpg' },
  { id: '12', name: 'Azitromicina', genericName: 'Klaricid / Antibiótico 500mg', price: 120, category: 'Antibióticos', requiresPrescription: true, stock: 30, presentation: 'Caja con 3 tabletas', imageUrl: 'https://appdesign.appdesignproyectos.com/acitromizina.jpg' }
];

const CATEGORIES = ['Todos', 'Analgésicos', 'Antibióticos', 'Antisépticos', 'Curación', 'Gastrointestinal', 'Alergias', 'Suplementos'];

export default function App() {
  // Inicialización del carrito con los 2 o 3 productos de ejemplo
  const [cart, setCart] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 2 }, // Paracetamol 500mg x 2 ($40)
    { product: PRODUCTS[2], quantity: 1 }, // Alcohol en Gel x 1 ($45)
    { product: PRODUCTS[3], quantity: 1 }  // Gasas Estériles x 1 ($15)
  ]);

  // Estados de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Estados para Cobro / Pago
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [prescriptionVerified, setPrescriptionVerified] = useState({
    retained: false,
    doctorValidated: false,
    dateChecked: false
  });

  // Alerta de Receta Médica Reciente
  const [prescriptionAlert, setPrescriptionAlert] = useState<string | null>(null);

  // Historial de ventas del día
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([
    {
      id: 'V-1001',
      timestamp: new Date(new Date().getTime() - 2 * 3600000), // Hace 2 horas
      items: [
        { product: PRODUCTS[1], quantity: 1 }, // Ibuprofeno
        { product: PRODUCTS[4], quantity: 1 }  // Amoxicilina
      ],
      total: 120,
      paymentMethod: 'Tarjeta',
      cashReceived: 120,
      change: 0,
      ticketNumber: 'FSM-20260702-0041'
    }
  ]);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);

  // Reloj en tiempo real
  const [currentTime, setCurrentTime] = useState(new Date());

  // Input ref para enfocar la búsqueda automáticamente
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estados para validación de receta interactiva
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [pendingPrescriptionProduct, setPendingPrescriptionProduct] = useState<Product | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorLicense, setDoctorLicense] = useState('');
  
  // Array temporal en memoria para guardar las recetas validadas
  const [prescriptionRecords, setPrescriptionRecords] = useState<Array<{
    id: string;
    productId: string;
    productName: string;
    doctorName: string;
    doctorLicense: string;
    timestamp: Date;
  }>>([]);

  // Estado para modal de corte de turno
  const [showShiftCutModal, setShowShiftCutModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Escuchar Atajos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 para cobrar
      if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0) {
          triggerCobrar();
        }
      }
      // Esc para cerrar modales o cancelar compra si no hay modales abiertos
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showCheckoutModal) {
          setShowCheckoutModal(false);
        } else if (showCancelModal) {
          setShowCancelModal(false);
        } else if (showHistoryModal) {
          setShowHistoryModal(false);
        } else if (showSuccessModal) {
          setShowSuccessModal(false);
        } else {
          if (cart.length > 0) {
            setShowCancelModal(true);
          }
        }
      }
      // F2 para enfocar buscador
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showCheckoutModal, showCancelModal, showHistoryModal, showSuccessModal]);

  // Cálculos del Carrito
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const total = subtotal; // Tasa 0% IVA en medicamentos

  // Verificar si hay medicamentos con receta obligatoria en el carrito
  const hasPrescriptionMedication = cart.some(item => item.product.requiresPrescription);

  // Acciones del Carrito
  const addToCart = (product: Product, bypassPrescription?: boolean) => {
    if (product.requiresPrescription && !bypassPrescription) {
      setPendingPrescriptionProduct(product);
      setDoctorName('');
      setDoctorLicense('');
      setShowPrescriptionModal(true);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }

    // Detonar alerta visual si el medicamento requiere receta médica
    if (product.requiresPrescription) {
      setPrescriptionAlert(`El producto "${product.name}" requiere verificar receta médica física para su venta.`);
      // Limpiar alerta automáticamente después de 4 segundos
      setTimeout(() => {
        setPrescriptionAlert(null);
      }, 5000);
    }
  };

  const handleValidatePrescription = () => {
    if (!pendingPrescriptionProduct) return;
    if (!doctorName.trim() || !doctorLicense.trim()) {
      alert("Por favor ingrese de forma obligatoria el Nombre del Médico y la Cédula Profesional.");
      return;
    }

    const newRecord = {
      id: `REC-${Date.now()}`,
      productId: pendingPrescriptionProduct.id,
      productName: pendingPrescriptionProduct.name,
      doctorName: doctorName.trim(),
      doctorLicense: doctorLicense.trim(),
      timestamp: new Date()
    };
    setPrescriptionRecords(prev => [...prev, newRecord]);

    // Agregar producto al carrito con bypass
    addToCart(pendingPrescriptionProduct, true);

    // Cerrar modal
    setShowPrescriptionModal(false);
    setPendingPrescriptionProduct(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);
    setCart(updated);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setShowCancelModal(false);
  };

  const triggerCobrar = () => {
    setPrescriptionVerified({
      retained: true,
      doctorValidated: true,
      dateChecked: true
    });
    setCashReceived('');
    setPaymentMethod('cash');
    setShowCheckoutModal(true);
  };

  // Confirmar y registrar venta final
  const [showPrescriptionNotice, setShowPrescriptionNotice] = useState(false);

  const handleFinalizeSale = () => {
    const numericCash = parseFloat(cashReceived) || total;
    const change = paymentMethod === 'cash' ? Math.max(0, numericCash - total) : 0;
    const dateNow = new Date();
    
    // Generar folio de ticket aleatorio
    const ticketNum = `FSM-${dateNow.getFullYear()}${String(dateNow.getMonth() + 1).padStart(2, '0')}${String(dateNow.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSale: SaleRecord = {
      id: `V-${Date.now()}`,
      timestamp: dateNow,
      items: [...cart],
      total: total,
      paymentMethod: paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia',
      cashReceived: paymentMethod === 'cash' ? numericCash : total,
      change: change,
      ticketNumber: ticketNum
    };

    const hasPrescription = cart.some(item => item.product.requiresPrescription);
    setShowPrescriptionNotice(hasPrescription);
    if (hasPrescription) {
      alert("Datos de receta registrados exitosamente.");
    }

    setSalesHistory([newSale, ...salesHistory]);
    setLastSale(newSale);
    setCart([]);
    setShowCheckoutModal(false);
    setShowSuccessModal(true);
  };

  // Filtrado de Productos
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="pos-root" className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. HEADER DEL PUNTO DE VENTA (Sleek Theme Design) */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          {/* Logotipo: Botón + verde esmeralda */}
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
            +
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-900">
              Farmacias <span className="text-emerald-600">San Matías</span>
            </h1>
          </div>
        </div>

        {/* Estatus, cajero y atajos */}
        <div className="flex items-center space-x-6 text-sm">
          {/* Teclas rápidas informativas */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 font-mono">
            <span><strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shadow-sm">F2</strong> Buscar</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shadow-sm">F12</strong> Cobrar</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 shadow-sm">Esc</strong> Cancelar</span>
          </div>

          {/* Estatus de Conexión */}
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            • EN LÍNEA
          </span>

          {/* Información del cajero */}
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cajero</p>
              <p className="text-sm text-slate-700 font-bold">J. Pérez</p>
            </div>
            <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
              <User className="w-4.5 h-4.5 text-blue-600" />
            </div>
          </div>

          {/* Botón Historial de Ventas */}
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-xl transition-all cursor-pointer relative shadow-sm"
            title="Ver Historial de Ventas"
          >
            <History className="w-5 h-5 text-emerald-600" />
            {salesHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {salesHistory.length}
              </span>
            )}
          </button>

          {/* Botón Corte de Turno */}
          <button 
            onClick={() => {
              // Calcular total y medicamentos controlados antes de mostrar
              setShowShiftCutModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg"
            title="Realizar Corte de Caja del Turno"
          >
            <Activity className="w-4 h-4 text-white" />
            <span>Corte de Turno</span>
          </button>
        </div>
      </header>

      {/* 2. DISEÑO PRINCIPAL (Dividido 40% Izquierda - Carrito / 60% Derecha - Productos) */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* ================= SECCIÓN IZQUIERDA (40% de ancho) - CARRITO DE COMPRAS ================= */}
        <section id="left-cart" className="w-[40%] bg-white border-r border-slate-200 flex flex-col shadow-inner h-full relative">
          
          {/* Encabezado del Carrito */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold uppercase tracking-wider text-xs text-blue-900">CARRITO DE COMPRA</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
              ID: #55291
            </span>
          </div>

          {/* Alerta de Receta Médica en el carrito si aplica */}
          {hasPrescriptionMedication && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center space-x-2 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
              <p className="text-xs font-semibold leading-snug">
                Requiere validación de receta física al cobrar.
              </p>
            </div>
          )}

          {/* Listado de Productos en el Carrito */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
            <AnimatePresence initial={false}>
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-3 p-8"
                >
                  <Receipt className="w-16 h-16 text-slate-300 stroke-1" />
                  <div>
                    <p className="text-base font-semibold text-slate-500">El carrito está vacío</p>
                    <p className="text-xs text-slate-400 mt-1">Haga clic en los botones rápidos de productos para agregarlos.</p>
                  </div>
                </motion.div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    key={item.product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex justify-between items-center p-2.5 bg-white border rounded-xl shadow-sm hover:border-slate-200 transition-all ${
                      item.product.requiresPrescription 
                        ? 'border-amber-200 bg-amber-50/10' 
                        : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0 mr-2">
                      {/* Thumbnail */}
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100 mr-2.5">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                          />
                        ) : (
                          <Activity className="w-4 h-4 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-blue-900 text-sm truncate">{item.product.name}</span>
                          {item.product.requiresPrescription && (
                            <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                              Receta
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{item.product.genericName}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">${item.product.price.toFixed(2)} c/u • {item.product.presentation}</p>
                      </div>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold font-mono text-xs text-slate-800">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => addToCart(item.product)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right w-16">
                        <p className="text-sm font-bold font-mono text-blue-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Sección de Cuentas y Totales en la parte inferior */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-4 flex-shrink-0">
            <div className="space-y-1.5 text-xs text-slate-500 font-medium">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-mono text-slate-700 font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center">
                  Medicamentos tasa 0% IVA
                  <Info className="w-3 h-3 text-slate-400 ml-1" />
                </span>
                <span className="font-mono text-slate-400 font-semibold">$0.00</span>
              </div>
              <div className="border-t border-slate-200/60 my-1"></div>
              
              {/* Total en tipografía gigante */}
              <div className="flex justify-between items-end mb-2 pt-1">
                <span className="text-sm font-bold text-slate-500 uppercase">TOTAL</span>
                <span className="text-6xl font-black text-blue-900 font-mono tracking-tighter">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones Interactivos Grandes del Carrito */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  if (cart.length > 0) {
                    setShowCancelModal(true);
                  }
                }}
                disabled={cart.length === 0}
                className="h-24 bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white rounded-xl shadow-lg shadow-red-200 flex flex-col items-center justify-center gap-1 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <span className="text-xl font-bold tracking-widest">CANCELAR</span>
                <span className="text-[10px] font-bold opacity-80 uppercase">(Esc)</span>
              </button>

              <button 
                onClick={triggerCobrar}
                disabled={cart.length === 0}
                className="h-24 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white rounded-xl shadow-lg shadow-emerald-200 flex flex-col items-center justify-center gap-1 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <span className="text-2xl font-black tracking-widest">COBRAR</span>
                <span className="text-xs font-bold opacity-80 uppercase">(F12)</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= SECCIÓN DERECHA (60% de ancho) - CUADRÍCULA DE PRODUCTOS DE ALTA ROTACIÓN ================= */}
        <section id="right-products" className="w-[60%] p-6 flex flex-col gap-6 bg-slate-100 h-full overflow-hidden">
          
          {/* Barra superior de Filtros y Buscador */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between flex-shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Buscar medicamento rápido... (Atajo: F2)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categorías de Filtro */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              PRODUCTOS DE ALTA ROTACIÓN
            </h3>
            <span className="text-xs font-bold text-slate-400 font-mono">
              Mostrando {filteredProducts.length} productos
            </span>
          </div>

          {/* Cuadrícula de Botones Grandes (mínimo 120px de alto, táctiles) */}
          <div className="flex-1 overflow-y-auto pb-6">
            {filteredProducts.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <p className="text-sm font-semibold">No se encontraron medicamentos</p>
                <p className="text-xs mt-1">Pruebe con otra búsqueda o categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isInCart = cart.find(item => item.product.id === product.id)?.quantity || 0;
                  return (
                    <motion.button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      whileTap={{ scale: 0.96 }}
                      className={`bg-white border-2 rounded-2xl p-4 shadow-md flex flex-col justify-between items-start text-left min-h-[300px] transition-all hover:shadow-xl group relative overflow-hidden cursor-pointer ${
                        product.requiresPrescription 
                          ? 'border-blue-100 hover:border-amber-500' 
                          : 'border-transparent hover:border-emerald-500'
                      }`}
                    >
                      {/* Badge de Cantidad en el Carrito */}
                      <AnimatePresence>
                        {isInCart > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-3 right-3 bg-blue-600 text-white font-mono font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
                          >
                            {isInCart}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Image container */}
                      <div className="w-full h-32 bg-slate-50/80 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center border border-slate-100">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Activity className="w-8 h-8 text-slate-300" />
                        )}
                        
                        {/* Medical icon or Prescription badge on top of image */}
                        <div className="absolute top-2 left-2">
                          {product.requiresPrescription ? (
                            <span className="bg-amber-100/90 backdrop-blur-xs text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-amber-200">
                              Receta
                            </span>
                          ) : (
                            <span className="bg-emerald-50/90 backdrop-blur-xs text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border border-emerald-200">
                              Libre
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info & Price */}
                      <div className="w-full flex-1 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-base text-blue-950 group-hover:text-emerald-700 transition-colors uppercase tracking-tight line-clamp-1">
                            {product.name}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {product.genericName}
                          </p>
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            {product.presentation}
                          </p>
                        </div>
                        
                        <div className="text-xl font-mono text-emerald-600 font-bold mt-2 flex items-baseline gap-1">
                          ${product.price.toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-sans font-normal">MXN</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. FOOTER DEL PUNTO DE VENTA (Sleek Theme Design) */}
      <footer className="h-10 bg-blue-950 text-slate-300 flex items-center px-6 justify-between text-[10px] font-medium uppercase tracking-widest flex-shrink-0 z-10">
        <div className="flex gap-8">
          <span>Vendedor: J. Pérez</span>
          <span>Terminal: POS-772</span>
          <span>Turno: Matutino</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold">Base de Datos Conectada</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentTime.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {currentTime.toLocaleTimeString()}</span>
        </div>
      </footer>

      {/* ================= MODAL: PROCESAR COBRO (F12) ================= */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 text-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col md:flex-row h-[520px]"
            >
              {/* Resumen Izquierdo del Cobro */}
              <div className="md:w-5/12 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs uppercase tracking-wider font-bold">Resumen de Venta</span>
                  </div>
                  <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product.id} className="text-xs flex justify-between py-1.5 border-b border-slate-200/60">
                        <span className="text-slate-600 truncate max-w-[120px] font-semibold">{item.product.name} <span className="text-slate-400 font-mono text-[10px]">x{item.quantity}</span></span>
                        <span className="text-slate-700 font-mono font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Monto Total a Pagar</span>
                  <p className="text-5xl font-extrabold font-mono text-blue-900 mt-1 tracking-tight">
                    ${total.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono italic mt-0.5">Medicamentos exentos de IVA</p>
                </div>
              </div>

              {/* Registro de Pago y Receta */}
              <div className="md:w-7/12 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-blue-950 uppercase tracking-tight">Registrar Cobro</h3>
                    <button 
                      onClick={() => setShowCheckoutModal(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Selector de Método de Pago */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Método de Pago</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => { setPaymentMethod('cash'); setCashReceived(''); }}
                        className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === 'cash' 
                            ? 'bg-blue-50 border-blue-600 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Efectivo</span>
                      </button>
                      <button 
                        onClick={() => { setPaymentMethod('card'); setCashReceived(total.toString()); }}
                        className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === 'card' 
                            ? 'bg-blue-50 border-blue-600 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Tarjeta</span>
                      </button>
                      <button 
                        onClick={() => { setPaymentMethod('transfer'); setCashReceived(total.toString()); }}
                        className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === 'transfer' 
                            ? 'bg-blue-50 border-blue-600 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Transf.</span>
                      </button>
                    </div>
                  </div>

                  {/* Sección Efectivo */}
                  {paymentMethod === 'cash' ? (
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dinero Recibido</label>
                        <button 
                          onClick={() => setCashReceived(total.toString())}
                          className="text-[10px] text-emerald-600 hover:underline font-bold cursor-pointer"
                        >
                          Pago Exacto
                        </button>
                      </div>
                      
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono font-bold text-sm">$</span>
                        <input
                          type="number"
                          step="any"
                          className="block w-full pl-7 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                          placeholder="0.00"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                        />
                      </div>

                      <div className="flex space-x-1.5 overflow-x-auto pt-0.5 pb-0.5 scrollbar-none">
                        {[50, 100, 200, 500, 1000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              const curr = parseFloat(cashReceived) || 0;
                              setCashReceived((curr + val).toString());
                            }}
                            className="bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-600 px-2 py-1 rounded transition-all cursor-pointer"
                          >
                            +${val}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg border border-slate-200/60 mt-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Cambio:</span>
                        <span className={`text-lg font-bold font-mono ${
                          (parseFloat(cashReceived) || 0) >= total 
                            ? 'text-emerald-600' 
                            : 'text-red-500'
                        }`}>
                          ${(Math.max(0, (parseFloat(cashReceived) || 0) - total)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-500 text-xs">
                      El monto de <strong className="text-slate-800">${total.toFixed(2)}</strong> se cargará automáticamente en la terminal.
                    </div>
                  )}

                  {/* Requisitos de Medicamento Controlado */}
                  {hasPrescriptionMedication && (
                    <div className="space-y-1.5 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                      <div className="flex items-center space-x-1 text-amber-800 text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                        <span>Validación de Antibióticos</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Por ley federal, marque los requisitos validados en la receta:
                      </p>
                      <div className="space-y-1.5 mt-2">
                        <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={prescriptionVerified.retained}
                            onChange={(e) => setPrescriptionVerified({ ...prescriptionVerified, retained: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                          />
                          <span>Receta física retenida</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={prescriptionVerified.doctorValidated}
                            onChange={(e) => setPrescriptionVerified({ ...prescriptionVerified, doctorValidated: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                          />
                          <span>Cédula y Médico registrados</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={prescriptionVerified.dateChecked}
                            onChange={(e) => setPrescriptionVerified({ ...prescriptionVerified, dateChecked: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                          />
                          <span>Fecha Comprobada (&lt; 72h)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón Finalizar */}
                <button
                  type="button"
                  onClick={handleFinalizeSale}
                  disabled={
                    (paymentMethod === 'cash' && (parseFloat(cashReceived) || 0) < total) ||
                    (hasPrescriptionMedication && !(prescriptionVerified.retained && prescriptionVerified.doctorValidated && prescriptionVerified.dateChecked))
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed uppercase"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar Pago</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: CONFIRMAR CANCELAR COMPRA ================= */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-800"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-blue-950">¿Vaciar Carrito?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Esta acción eliminará todos los productos cargados actualmente en el carrito de compras.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer text-center transition-all"
                >
                  CONSERVAR
                </button>
                <button 
                  onClick={clearCart}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs cursor-pointer text-center transition-all shadow-md"
                >
                  SÍ, VACIAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: HISTORIAL DE VENTAS ================= */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl max-w-xl w-full flex flex-col h-[520px] text-slate-800"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-blue-950">Historial de Ventas del Turno</h3>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ventas Totales</p>
                  <p className="text-lg font-extrabold font-mono text-emerald-600 mt-0.5">
                    ${salesHistory.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{salesHistory.length} transacciones</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Efectivo</p>
                  <p className="text-lg font-extrabold font-mono text-blue-600 mt-0.5">
                    ${salesHistory.filter(s => s.paymentMethod === 'Efectivo').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Fondo base: $1,000.00</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Electrónico</p>
                  <p className="text-lg font-extrabold font-mono text-purple-600 mt-0.5">
                    ${salesHistory.filter(s => s.paymentMethod !== 'Efectivo').reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Tarjeta / Transf.</p>
                </div>
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {salesHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <FileText className="w-12 h-12 mb-2 stroke-1" />
                    <p className="text-xs">No se han registrado ventas en este turno.</p>
                  </div>
                ) : (
                  salesHistory.map((sale) => (
                    <div key={sale.id} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-700">{sale.ticketNumber}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                            sale.paymentMethod === 'Efectivo' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {sale.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {sale.timestamp.toLocaleTimeString()} | {sale.items.reduce((sum, i) => sum + i.quantity, 0)} pzas
                        </p>
                        <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[340px]">
                          {sale.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-emerald-600">${sale.total.toFixed(2)}</p>
                        <button 
                          onClick={() => {
                            setLastSale(sale);
                            setShowHistoryModal(false);
                            setShowSuccessModal(true);
                          }}
                          className="text-[10px] text-blue-600 hover:underline mt-1 cursor-pointer flex items-center justify-end space-x-0.5 font-bold"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Imprimir copia</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-5 py-2 rounded-xl text-xs cursor-pointer transition-all font-bold"
                >
                  CERRAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: TICKET EXCITOSO ================= */}
      <AnimatePresence>
        {showSuccessModal && lastSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-6 text-slate-850 shadow-2xl"
            >
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-blue-950">¡Venta Procesada!</h3>
                <p className="text-xs text-slate-500">Imprimiendo ticket térmico...</p>
              </div>

              {/* Mensaje de registro de receta */}
              {showPrescriptionNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-center space-x-2 text-center shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping flex-shrink-0"></span>
                  <span>Datos de receta registrados exitosamente</span>
                </div>
              )}

              {/* Representación de ticket físico */}
              <div className="bg-slate-50 text-slate-900 p-4 rounded-lg border border-slate-200 font-mono text-[10px] space-y-2 max-h-[260px] overflow-y-auto">
                <div className="text-center space-y-0.5">
                  <p className="font-bold text-xs">FARMACIAS SAN MATÍAS</p>
                  <p className="text-[9px] text-slate-500">Cerrada de San Matías #148</p>
                  <p className="text-[8px] text-slate-400">RFC: FSM-260312-SM1</p>
                </div>
                <div className="border-b border-dashed border-slate-300 my-1"></div>
                
                <p><strong>Folio:</strong> {lastSale.ticketNumber}</p>
                <p><strong>Fecha:</strong> {lastSale.timestamp.toLocaleDateString()} {lastSale.timestamp.toLocaleTimeString()}</p>
                <p><strong>Vendedor:</strong> J. Pérez</p>
                
                <div className="border-b border-dashed border-slate-300 my-1"></div>
                
                <div className="space-y-1">
                  {lastSale.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-b border-dashed border-slate-300 my-1"></div>
                
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL:</span>
                  <span>${lastSale.total.toFixed(2)} MXN</span>
                </div>
                
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Pago: {lastSale.paymentMethod}</span>
                  {lastSale.paymentMethod === 'Efectivo' && (
                    <span>Cambio: ${(lastSale.change).toFixed(2)}</span>
                  )}
                </div>

                <div className="border-b border-dashed border-slate-300 my-1"></div>
                <p className="text-center text-[9px] text-slate-500 font-sans font-medium mt-1">¡Gracias por su preferencia!</p>
              </div>

              {/* Botón para Cerrar */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    alert("Ticket enviado a la cola de impresión térmica.");
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer text-center"
                >
                  REIMPRIMIR
                </button>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer text-center shadow-md"
                >
                  LISTO (ENTER)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= ALERTA DE REQUISITO DE RECETA (TOAST) ================= */}
      <AnimatePresence>
        {prescriptionAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 right-6 max-w-sm bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-2xl z-40 flex items-start space-x-3 text-amber-900"
          >
            <div className="w-8 h-8 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-800">Antibiótico Detectado</p>
              <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
                {prescriptionAlert}
              </p>
            </div>
            <button 
              onClick={() => setPrescriptionAlert(null)}
              className="text-amber-500 hover:text-amber-700 flex-shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: VALIDACIÓN DE RECETA (MANDATORIA) ================= */}
      <AnimatePresence>
        {showPrescriptionModal && pendingPrescriptionProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-55 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-6 text-slate-800 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-1">
                  <FileText className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-blue-950 uppercase tracking-tight">Validación Obligatoria de Receta</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  El medicamento <span className="text-amber-600 font-bold">{pendingPrescriptionProduct.name}</span> es un controlado que requiere receta médica física válida.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nombre Completo del Médico <span className="text-red-500 font-bold">*</span></label>
                  <input 
                    type="text"
                    placeholder="Ej. Dr. Alejandro Gómez"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="block w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-base text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cédula Profesional <span className="text-red-500 font-bold">*</span></label>
                  <input 
                    type="text"
                    placeholder="Ej. 12345678"
                    value={doctorLicense}
                    onChange={(e) => setDoctorLicense(e.target.value)}
                    className="block w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-base text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setPendingPrescriptionProduct(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs cursor-pointer text-center border-2 border-slate-200 uppercase transition-all"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleValidatePrescription}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-xs cursor-pointer text-center shadow-md hover:shadow-lg transition-all uppercase"
                >
                  VALIDAR RECETA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: CORTE DE TURNO (CORTE DE CAJA) ================= */}
      <AnimatePresence>
        {showShiftCutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-6 text-slate-850 shadow-2xl"
            >
              <div className="text-center space-y-1">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Activity className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-blue-950 uppercase tracking-tight">Corte de Caja del Turno</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Farmacias San Matías</p>
              </div>

              {/* Contenedor de estadísticas */}
              <div className="space-y-4">
                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-xs">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Vendido en el Turno:</span>
                  <span className="text-2xl font-black font-mono text-emerald-600">
                    ${salesHistory.reduce((sum, s) => sum + s.total, 0).toFixed(2)} MXN
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                    Medicamentos Controlados con Receta:
                  </span>
                  
                  {(() => {
                    // Contar todos los medicamentos controlados vendidos en la historia de este turno
                    const controlledCounts: Record<string, number> = {};
                    salesHistory.forEach(sale => {
                      sale.items.forEach(item => {
                        if (item.product.requiresPrescription) {
                          controlledCounts[item.product.name] = (controlledCounts[item.product.name] || 0) + item.quantity;
                        }
                      });
                    });

                    const keys = Object.keys(controlledCounts);
                    if (keys.length === 0) {
                      return (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border-2 border-slate-100 text-center">
                          No se han vendido medicamentos controlados en este turno.
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto bg-slate-50 border-2 border-slate-100 rounded-2xl p-3">
                        {keys.map((name) => (
                          <div key={name} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200/40 last:border-0">
                            <span className="text-slate-700 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                              {name}
                            </span>
                            <span className="bg-amber-100 text-amber-800 font-mono font-black px-2 py-0.5 rounded-lg text-[10px]">
                              {controlledCounts[name]} {controlledCounts[name] === 1 ? 'unidad' : 'unidades'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Botón para Cerrar */}
              <button 
                onClick={() => setShowShiftCutModal(false)}
                className="w-full bg-blue-950 hover:bg-blue-900 text-white font-black py-4 rounded-xl text-xs cursor-pointer text-center shadow-md transition-all uppercase tracking-wider animate-pulse"
              >
                CERRAR RESUMEN
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
