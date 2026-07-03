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
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface Lote {
  codigo: string;
  fechaCaducidad: string; // AAAA-MM-DD
}

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
  lotes?: Lote[];
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

// Catálogo de Productos de Alta Rotación con sus Lotes y Fechas de Caducidad iniciales
// Fecha de referencia del sistema en el simulador: 2026-07-02
const PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Paracetamol', 
    genericName: 'Tempra / Analgésico 500mg', 
    price: 20, 
    category: 'Analgésicos', 
    requiresPrescription: false, 
    stock: 120, 
    presentation: 'Caja con 20 tabletas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/paracetamol.jpg',
    lotes: [{ codigo: 'LT-PAR-022', fechaCaducidad: '2026-08-15' }] // ~44 días: Amarillo
  },
  { 
    id: '2', 
    name: 'Ibuprofeno', 
    genericName: 'Advil / Antiinflamatorio 400mg', 
    price: 35, 
    category: 'Analgésicos', 
    requiresPrescription: false, 
    stock: 85, 
    presentation: 'Caja con 10 cápsulas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/ibuprofeno.jpg',
    lotes: [{ codigo: 'LT-IBU-031', fechaCaducidad: '2026-07-12' }] // ~10 días: Rojo Parpadeante
  },
  { 
    id: '3', 
    name: 'Alcohol en Gel', 
    genericName: 'Antiséptico antibacterial 70%', 
    price: 45, 
    category: 'Antisépticos', 
    requiresPrescription: false, 
    stock: 50, 
    presentation: 'Frasco con 250ml', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/alcohol.jpg',
    lotes: [{ codigo: 'LT-ALC-109', fechaCaducidad: '2027-05-20' }] // Verde
  },
  { 
    id: '4', 
    name: 'Gasas Estériles', 
    genericName: 'Material de curación 10x10cm', 
    price: 15, 
    category: 'Curación', 
    requiresPrescription: false, 
    stock: 200, 
    presentation: 'Paquete con 10 piezas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/gasas.webp',
    lotes: [{ codigo: 'LT-GAS-004', fechaCaducidad: '2027-09-12' }] // Verde
  },
  { 
    id: '5', 
    name: 'Amoxicilina', 
    genericName: 'Amoxil / Antibiótico 500mg', 
    price: 85, 
    category: 'Antibióticos', 
    requiresPrescription: true, 
    stock: 40, 
    presentation: 'Caja con 12 cápsulas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/amoxcicilina.jpg',
    lotes: [{ codigo: 'LT-AMX-505', fechaCaducidad: '2026-07-22' }] // ~20 días: Rojo Parpadeante
  },
  { 
    id: '6', 
    name: 'Omeprazol', 
    genericName: 'Inhibidor gástrico 20mg', 
    price: 30, 
    category: 'Gastrointestinal', 
    requiresPrescription: false, 
    stock: 150, 
    presentation: 'Caja con 14 cápsulas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/omeprazol.jpg',
    lotes: [{ codigo: 'LT-OME-144', fechaCaducidad: '2026-08-28' }] // ~57 días: Amarillo
  },
  { 
    id: '7', 
    name: 'Loratadina', 
    genericName: 'Claritin / Antihistamínico 10mg', 
    price: 25, 
    category: 'Alergias', 
    requiresPrescription: false, 
    stock: 95, 
    presentation: 'Caja con 10 tabletas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/loratalina.jpg',
    lotes: [{ codigo: 'LT-LOR-771', fechaCaducidad: '2027-01-10' }] // Verde
  },
  { 
    id: '8', 
    name: 'Vitamina C', 
    genericName: 'Redoxon / Tab. Masticables', 
    price: 60, 
    category: 'Suplementos', 
    requiresPrescription: false, 
    stock: 70, 
    presentation: 'Frasco con 30 tabletas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/vitaminac.jpg',
    lotes: [{ codigo: 'LT-VIT-882', fechaCaducidad: '2026-11-30' }] // Verde
  },
  { 
    id: '9', 
    name: 'Naproxeno', 
    genericName: 'Flanax / Analgésico 250mg', 
    price: 40, 
    category: 'Analgésicos', 
    requiresPrescription: false, 
    stock: 110, 
    presentation: 'Caja con 12 tabletas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/naproxeno.jpg',
    lotes: [{ codigo: 'LT-NAP-993', fechaCaducidad: '2027-03-15' }] // Verde
  },
  { 
    id: '10', 
    name: 'Jeringa Desechable', 
    genericName: 'Material de curación 5ml con aguja', 
    price: 12, 
    category: 'Curación', 
    requiresPrescription: false, 
    stock: 300, 
    presentation: 'Unidad de 5ml', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/jeringas.jpg',
    lotes: [{ codigo: 'LT-JER-101', fechaCaducidad: '2028-06-01' }] // Verde
  },
  { 
    id: '11', 
    name: 'Alcohol Etílico', 
    genericName: 'Desinfectante de heridas 96°', 
    price: 38, 
    category: 'Antisépticos', 
    requiresPrescription: false, 
    stock: 65, 
    presentation: 'Botella de 500ml', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/alcoholetilico.jpg',
    lotes: [{ codigo: 'LT-ALE-112', fechaCaducidad: '2027-08-14' }] // Verde
  },
  { 
    id: '12', 
    name: 'Azitromicina', 
    genericName: 'Klaricid / Antibiótico 500mg', 
    price: 120, 
    category: 'Antibióticos', 
    requiresPrescription: true, 
    stock: 30, 
    presentation: 'Caja con 3 tabletas', 
    imageUrl: 'https://appdesign.appdesignproyectos.com/acitromizina.jpg',
    lotes: [{ codigo: 'LT-AZI-123', fechaCaducidad: '2026-12-15' }] // Verde
  }
];

const CATEGORIES = ['Todos', 'Analgésicos', 'Antibióticos', 'Antisépticos', 'Curación', 'Gastrointestinal', 'Alergias', 'Suplementos'];

// ================= INDEXEDDB LOCAL PERSISTENCE HELPERS =================
const DB_NAME = 'FarmaciaSanMatiasDB';
const DB_VERSION = 1;

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('inventario')) {
        db.createObjectStore('inventario', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('ventas')) {
        db.createObjectStore('ventas', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('recetas')) {
        db.createObjectStore('recetas', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return initDB().then((db) => {
    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function putInStore<T>(storeName: string, value: T): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

function putManyInStore<T>(storeName: string, values: T[]): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      values.forEach(val => {
        store.put(val);
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  });
}

function getLoteExpirationLevel(product: Product): { level: 'red' | 'yellow' | 'green' | 'none'; days: number; nextLote?: Lote } {
  if (!product.lotes || product.lotes.length === 0) return { level: 'none', days: Infinity };
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let minDays = Infinity;
  let nextLote: Lote | undefined = undefined;

  for (const lote of product.lotes) {
    const exp = new Date(lote.fechaCaducidad + 'T00:00:00');
    exp.setHours(0, 0, 0, 0);
    const diff = exp.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < minDays) {
      minDays = days;
      nextLote = lote;
    }
  }

  if (minDays <= 30) return { level: 'red', days: minDays, nextLote };
  if (minDays <= 90) return { level: 'yellow', days: minDays, nextLote };
  return { level: 'green', days: minDays, nextLote };
}

export default function App() {
  // Estado para catálogo dinámico de productos (inventario)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

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

  // Estados para Control de Lotes y Alertas de Caducidad
  const [showLotesModal, setShowLotesModal] = useState(false);
  const [showMobileCartModal, setShowMobileCartModal] = useState(false);
  const [batchAlert, setBatchAlert] = useState<string | null>(null);
  const [loteSearchQuery, setLoteSearchQuery] = useState('');
  
  // Estado para el formulario de registrar nuevo lote
  const [newLoteProductId, setNewLoteProductId] = useState('');
  const [newLoteCodigo, setNewLoteCodigo] = useState('');
  const [newLoteFecha, setNewLoteFecha] = useState('');
  const [newLoteCantidad, setNewLoteCantidad] = useState('10');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga inicial y sincronización desde IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Cargar inventario de productos
        const localInventario = await getAllFromStore<Product>('inventario');
        const hasLotes = localInventario && localInventario.length > 0 && localInventario.some(p => p.lotes && p.lotes.length > 0);
        if (localInventario && localInventario.length > 0 && hasLotes) {
          setProducts(localInventario);
          // Actualizar las referencias del carrito con el stock más reciente
          setCart(prevCart => prevCart.map(item => {
            const freshProduct = localInventario.find(p => p.id === item.product.id);
            return freshProduct ? { ...item, product: freshProduct } : item;
          }));
        } else {
          // Si es la primera vez o no tiene lotes, sembrar el catálogo por defecto en el almacén
          await putManyInStore('inventario', PRODUCTS);
          setProducts(PRODUCTS);
        }

        // 2. Cargar historial de ventas
        const localVentas = await getAllFromStore<any>('ventas');
        if (localVentas && localVentas.length > 0) {
          const parsedVentas = localVentas.map(v => ({
            ...v,
            timestamp: v.timestamp instanceof Date ? v.timestamp : new Date(v.timestamp)
          }));
          parsedVentas.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setSalesHistory(parsedVentas);
        } else {
          // Sembrar venta por defecto para no mostrar historial vacío
          const defaultSale = {
            id: 'V-1001',
            timestamp: new Date(new Date().getTime() - 2 * 3600000),
            items: [
              { product: PRODUCTS[1], quantity: 1 },
              { product: PRODUCTS[4], quantity: 1 }
            ],
            total: 120,
            paymentMethod: 'Tarjeta',
            cashReceived: 120,
            change: 0,
            ticketNumber: 'FSM-20260702-0041'
          };
          await putInStore('ventas', defaultSale);
          setSalesHistory([defaultSale]);
        }

        // 3. Cargar recetas validadas históricas
        const localRecetas = await getAllFromStore<any>('recetas');
        if (localRecetas && localRecetas.length > 0) {
          const parsedRecetas = localRecetas.map(r => ({
            ...r,
            timestamp: r.timestamp instanceof Date ? r.timestamp : new Date(r.timestamp)
          }));
          setPrescriptionRecords(parsedRecetas);
        }
      } catch (err) {
        console.error('Error al cargar datos desde IndexedDB:', err);
      }
    };

    loadData();
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
    // Buscar la información más fresca de stock desde el catálogo local
    const freshProduct = products.find(p => p.id === product.id) || product;

    if (freshProduct.stock <= 0) {
      alert(`El producto "${freshProduct.name}" no cuenta con stock disponible en inventario.`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product.id === freshProduct.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart >= freshProduct.stock) {
      alert(`No hay suficiente stock disponible. Stock: ${freshProduct.stock} pzas`);
      return;
    }

    if (freshProduct.requiresPrescription && !bypassPrescription) {
      setPendingPrescriptionProduct(freshProduct);
      setDoctorName('');
      setDoctorLicense('');
      setShowPrescriptionModal(true);
      return;
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product: freshProduct, quantity: 1 }]);
    }

    // Detonar alerta visual si el medicamento requiere receta médica
    if (freshProduct.requiresPrescription) {
      setPrescriptionAlert(`El producto "${freshProduct.name}" requiere verificar receta médica física para su venta.`);
      // Limpiar alerta automáticamente después de 5 segundos
      setTimeout(() => {
        setPrescriptionAlert(null);
      }, 5000);
    }

    // Alerta de lote próximo a vencer (menos de 30 días)
    const expStatus = getLoteExpirationLevel(freshProduct);
    if (expStatus.level === 'red' && expStatus.nextLote) {
      setBatchAlert(`Atención: Despachar lote [${expStatus.nextLote.codigo}] por caducidad cercana`);
      // Limpiar alerta automáticamente después de 6 segundos
      setTimeout(() => {
        setBatchAlert(null);
      }, 6000);
    }
  };

  const handleSaveLote = async () => {
    if (!newLoteProductId || !newLoteCodigo.trim() || !newLoteFecha || !newLoteCantidad) {
      alert('Por favor complete todos los campos del lote.');
      return;
    }
    const qty = parseInt(newLoteCantidad) || 0;
    if (qty <= 0) {
      alert('La cantidad a ingresar debe ser mayor a cero.');
      return;
    }

    // Buscar producto
    const productIndex = products.findIndex(p => p.id === newLoteProductId);
    if (productIndex === -1) {
      alert('Producto no encontrado.');
      return;
    }

    const targetProduct = products[productIndex];
    const currentLotes = targetProduct.lotes || [];

    // Validar si el lote ya existe para este producto
    if (currentLotes.some(l => l.codigo.toUpperCase() === newLoteCodigo.trim().toUpperCase())) {
      alert('Este código de lote ya existe para este producto.');
      return;
    }

    const newLote: Lote = {
      codigo: newLoteCodigo.trim().toUpperCase(),
      fechaCaducidad: newLoteFecha
    };

    const updatedLotes = [...currentLotes, newLote];
    const updatedProduct: Product = {
      ...targetProduct,
      lotes: updatedLotes,
      stock: targetProduct.stock + qty // Increment stock!
    };

    const updatedProductsList = [...products];
    updatedProductsList[productIndex] = updatedProduct;

    // Actualizar base de datos IndexedDB
    try {
      await putInStore('inventario', updatedProduct);
      setProducts(updatedProductsList);
      
      // Mostrar confirmación
      alert(`Lote "${newLote.codigo}" registrado exitosamente. Se ha agregado al almacén de "inventario" en IndexedDB y se incrementó el stock de "${targetProduct.name}" en ${qty} unidades.`);

      // Limpiar campos del formulario
      setNewLoteCodigo('');
      setNewLoteFecha('');
      setNewLoteCantidad('10');
      setNewLoteProductId('');
    } catch (err) {
      console.error('Error al guardar el nuevo lote en IndexedDB:', err);
      alert('Error al guardar el lote en la base de datos.');
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
    const freshProduct = products.find(p => p.id === productId);
    if (!freshProduct) return;

    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty > freshProduct.stock) {
          alert(`No hay suficiente stock disponible para ${freshProduct.name}. Stock: ${freshProduct.stock} pzas`);
          return item;
        }
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

    // 1. Lógica de Stock Dinámico: Restar las piezas vendidas del stock disponible
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - cartItem.quantity)
        };
      }
      return p;
    });

    setProducts(updatedProducts);

    // Guardar los productos actualizados en el almacén de "inventario" de IndexedDB
    const productsToUpdateInDB = updatedProducts.filter(p => 
      cart.some(item => item.product.id === p.id)
    );
    putManyInStore('inventario', productsToUpdateInDB)
      .catch(err => console.error('Error al actualizar inventario en IndexedDB:', err));

    // 2. Registro Histórico: Guardar ticket generado en el almacén de "ventas"
    putInStore('ventas', newSale)
      .catch(err => console.error('Error al guardar la venta en IndexedDB:', err));

    // 3. Vincular y registrar datos del médico en el almacén de "recetas"
    const cartProductIds = cart.map(item => item.product.id);
    const relatedPrescriptions = prescriptionRecords
      .filter(rec => cartProductIds.includes(rec.productId))
      .map(rec => ({
        ...rec,
        ticketId: newSale.id,
        ticketNumber: newSale.ticketNumber
      }));

    if (relatedPrescriptions.length > 0) {
      putManyInStore('recetas', relatedPrescriptions)
        .catch(err => console.error('Error al guardar recetas en IndexedDB:', err));
    }

    setSalesHistory([newSale, ...salesHistory]);
    setLastSale(newSale);
    setCart([]);
    setShowCheckoutModal(false);
    setShowSuccessModal(true);
  };

  const handleSendWhatsApp = () => {
    if (!lastSale) return;
    
    const dateStr = lastSale.timestamp.toLocaleDateString() + ' ' + lastSale.timestamp.toLocaleTimeString();
    let text = `*FARMACIAS SAN MATÍAS*\n`;
    text += `=============================\n`;
    text += `*TICKET DE COMPRA DIGITAL*\n`;
    text += `*Folio:* ${lastSale.ticketNumber}\n`;
    text += `*Fecha:* ${dateStr}\n`;
    text += `=============================\n\n`;
    
    text += `*Detalle de Productos:*\n`;
    lastSale.items.forEach(item => {
      text += `- ${item.product.name} x${item.quantity} ($${(item.product.price * item.quantity).toFixed(2)} MXN)\n`;
    });
    text += `\n=============================\n`;
    text += `*TOTAL:* $${lastSale.total.toFixed(2)} MXN\n`;
    text += `*Método de Pago:* ${lastSale.paymentMethod}\n`;
    if (lastSale.paymentMethod === 'Efectivo') {
      text += `*Pago con:* $${lastSale.cashReceived.toFixed(2)} MXN\n`;
      text += `*Cambio:* $${lastSale.change.toFixed(2)} MXN\n`;
    }
    text += `=============================\n`;
    text += `¡Gracias por su preferencia!\n\n`;
    text += `_Farmacias San Matías - Cuidando de ti y de los tuyos_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtrado de Productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="pos-root" className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. HEADER DEL PUNTO DE VENTA (Sleek Theme Design) */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Logotipo: Botón + verde esmeralda */}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md">
            +
          </div>
          <div>
            <h1 className="text-base md:text-2xl font-extrabold tracking-tight text-blue-900">
              Farmacias <span className="text-emerald-600">San Matías</span>
            </h1>
          </div>
        </div>

        {/* Estatus, cajero y atajos */}
        <div className="flex items-center space-x-2 md:space-x-6 text-sm">
          {/* Teclas rápidas informativas */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 font-mono">
            <span><strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shadow-sm">F2</strong> Buscar</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shadow-sm">F12</strong> Cobrar</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 shadow-sm">Esc</strong> Cancelar</span>
          </div>

          {/* Estatus de Conexión */}
          <span className="hidden sm:flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] md:text-sm font-bold items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            • EN LÍNEA
          </span>

          {/* Información del cajero */}
          <div className="hidden md:flex items-center space-x-3 border-l border-slate-200 pl-4">
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
            <History className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
            {salesHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold font-mono text-[8px] md:text-[9px] w-4 h-4 md:w-4.5 md:h-4.5 rounded-full flex items-center justify-center">
                {salesHistory.length}
              </span>
            )}
          </button>

          {/* Botón Control de Lotes */}
          <button 
            onClick={() => {
              setShowLotesModal(true);
            }}
            className="bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-[10px] md:text-xs px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 md:gap-2 shadow-md hover:shadow-lg"
            title="Control de Lotes y Alertas de Caducidad"
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            <span className="hidden sm:inline">Control de Lotes</span>
            <span className="sm:hidden">Lotes</span>
          </button>

          {/* Botón Corte de Turno */}
          <button 
            onClick={() => {
              setShowShiftCutModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] md:text-xs px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 md:gap-2 shadow-md hover:shadow-lg"
            title="Realizar Corte de Caja del Turno"
          >
            <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            <span className="hidden sm:inline">Corte de Turno</span>
            <span className="sm:hidden">Corte</span>
          </button>
        </div>
      </header>

      {/* 2. DISEÑO PRINCIPAL (Dividido 40% Izquierda - Carrito / 60% Derecha - Productos) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ================= SECCIÓN IZQUIERDA (40% de ancho) - CARRITO DE COMPRAS ================= */}
        <section id="left-cart" className="hidden md:flex md:w-[40%] bg-white border-r border-slate-200 flex flex-col shadow-inner h-full relative">
          
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((product) => {
                  const isInCart = cart.find(item => item.product.id === product.id)?.quantity || 0;
                  const isOutOfStock = product.stock <= 0;
                  const expStatus = getLoteExpirationLevel(product);
                  
                  let borderClasses = '';
                  if (isOutOfStock) {
                    borderClasses = 'border-slate-200 bg-slate-50 opacity-60 filter grayscale cursor-not-allowed shadow-none';
                  } else {
                    if (expStatus.level === 'red') {
                      borderClasses = 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.35)] animate-[pulse_1.5s_infinite] cursor-pointer';
                    } else if (expStatus.level === 'yellow') {
                      borderClasses = 'border-amber-400 ring-2 ring-amber-400/40 shadow-md cursor-pointer hover:shadow-xl hover:border-amber-500';
                    } else if (expStatus.level === 'green') {
                      borderClasses = 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm cursor-pointer hover:shadow-xl hover:border-emerald-600';
                    } else {
                      borderClasses = product.requiresPrescription 
                        ? 'border-blue-100 hover:border-amber-500 hover:shadow-xl cursor-pointer' 
                        : 'border-transparent hover:border-emerald-500 hover:shadow-xl cursor-pointer';
                    }
                  }

                  return (
                    <motion.button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      whileTap={isOutOfStock ? {} : { scale: 0.96 }}
                      className={`bg-white border-2 rounded-2xl p-3 md:p-4 shadow-md flex flex-col justify-between items-start text-left min-h-[220px] md:min-h-[300px] transition-all group relative overflow-hidden ${borderClasses}`}
                    >
                      {/* Badge de Cantidad en el Carrito */}
                      <AnimatePresence>
                        {isInCart > 0 && !isOutOfStock && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-2 right-2 md:top-3 md:right-3 bg-blue-600 text-white font-mono font-bold text-[10px] md:text-xs w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-md z-10"
                          >
                            {isInCart}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Image container */}
                      <div className="w-full h-20 md:h-32 bg-slate-50/80 rounded-xl overflow-hidden mb-2 md:mb-3 relative flex items-center justify-center border border-slate-100">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-contain p-2 mix-blend-multiply transition-transform duration-300 ${!isOutOfStock && 'group-hover:scale-105'}`}
                          />
                        ) : (
                          <Activity className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
                        )}
                        
                        {/* Medical icon or Prescription badge on top of image */}
                        <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 z-10">
                          {product.requiresPrescription ? (
                            <span className="bg-amber-100/90 backdrop-blur-xs text-amber-800 text-[8px] md:text-[9px] font-black px-1.5 md:py-0.5 rounded-md uppercase border border-amber-200">
                              Receta
                            </span>
                          ) : (
                            <span className="bg-emerald-50/90 backdrop-blur-xs text-emerald-800 text-[8px] md:text-[9px] font-bold px-1.5 md:py-0.5 rounded-md uppercase border border-emerald-200">
                              Libre
                            </span>
                          )}
                        </div>

                        {/* Capa y Leyenda de Sin Stock */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center backdrop-blur-[1px] z-20 rounded-xl">
                            <span className="bg-red-600 text-white font-black text-[10px] md:text-xs px-2 py-1 md:py-1.5 rounded-lg shadow-md uppercase tracking-wider animate-pulse">
                              Sin Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info & Price */}
                      <div className="w-full flex-1 flex flex-col justify-between">
                        <div>
                          <div className={`font-bold text-xs md:text-base transition-colors uppercase tracking-tight line-clamp-1 ${isOutOfStock ? 'text-slate-400' : 'text-blue-950 group-hover:text-emerald-700'}`}>
                            {product.name}
                          </div>
                          <p className="text-[10px] md:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {product.genericName}
                          </p>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1 w-full gap-1">
                            <span className="text-[9px] md:text-[10px] text-slate-400 italic truncate max-w-full sm:max-w-[40%]">
                              {product.presentation}
                            </span>
                            <div className="flex flex-wrap items-center gap-1">
                              {/* Semáforo de Lote */}
                              {expStatus.level !== 'none' && (
                                <span className={`text-[8px] md:text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-1 ${
                                  expStatus.level === 'red' ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' :
                                  expStatus.level === 'yellow' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                  'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                }`} title={`Lote: ${expStatus.nextLote?.codigo} | Vence: ${expStatus.nextLote?.fechaCaducidad}`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    expStatus.level === 'red' ? 'bg-red-500' :
                                    expStatus.level === 'yellow' ? 'bg-amber-500' :
                                    'bg-emerald-500'
                                  }`} />
                                  {expStatus.days}d
                                </span>
                              )}
                              <span className={`text-[9px] md:text-[10px] font-bold font-mono px-1 py-0.5 rounded ${isOutOfStock ? 'bg-red-50 text-red-500' : product.stock <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                                Stk: {product.stock}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`text-sm md:text-xl font-mono font-bold mt-1 md:mt-2 flex items-baseline gap-1 ${isOutOfStock ? 'text-slate-400' : 'text-emerald-600'}`}>
                          ${product.price.toFixed(2)}
                          <span className="text-[9px] md:text-[10px] text-slate-400 font-sans font-normal">MXN</span>
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
      <footer className="hidden md:flex h-10 bg-blue-950 text-slate-300 items-center px-6 justify-between text-[10px] font-medium uppercase tracking-widest flex-shrink-0 z-10">
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

      {/* ================= PANEL FLOTANTE DE CARRITO PARA MÓVILES ================= */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_24px_rgba(0,0,0,0.15)] px-4 py-3 pb-6 z-40 flex items-center justify-between gap-3">
          {/* Lado Izquierdo: Resumen del Carrito (Clickeable para abrir el desglose) */}
          <div 
            onClick={() => setShowMobileCartModal(true)}
            className="flex items-center space-x-3 cursor-pointer flex-1"
          >
            <div className="relative bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-mono font-bold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Mi Carrito</span>
              <span className="text-xl font-black text-blue-900 font-mono tracking-tight">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Lado Derecho: Botón Cobrar */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              triggerCobrar();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs px-5 py-3.5 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <span>COBRAR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= MODAL: DESGLOSE DE CARRITO EN MÓVILES (BOTTOM SHEET) ================= */}
      <AnimatePresence>
        {showMobileCartModal && cart.length > 0 && (
          <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50">
            {/* Tap backdrop to close */}
            <div className="absolute inset-0" onClick={() => setShowMobileCartModal(false)} />

            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative z-10 text-slate-800 border-t border-slate-200"
            >
              {/* Handle bar */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 flex-shrink-0" onClick={() => setShowMobileCartModal(false)} />

              {/* Encabezado */}
              <div className="px-5 pb-3 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-blue-950 text-sm uppercase">Desglose de Compra</h3>
                </div>
                <button 
                  onClick={() => setShowMobileCartModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Listado de Productos */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {cart.map((item) => (
                  <div 
                    key={item.product.id}
                    className={`flex justify-between items-center p-3 bg-white border rounded-xl shadow-xs ${
                      item.product.requiresPrescription ? 'border-amber-200 bg-amber-50/5' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0 mr-2">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100 mr-2">
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
                        <span className="font-bold text-blue-900 text-xs truncate block">{item.product.name}</span>
                        <p className="text-[10px] text-slate-400 truncate">{item.product.genericName}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">${item.product.price.toFixed(2)} c/u</p>
                      </div>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 text-slate-500 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-[11px] text-slate-800">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => addToCart(item.product)}
                          className="p-1 text-slate-500 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right w-14 font-mono font-bold text-xs text-blue-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales y Acciones */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                <div className="space-y-1.5 text-xs text-slate-500 font-medium mb-4">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-700 font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 pt-1 border-t border-slate-200/50">
                    <span className="text-xs font-bold text-slate-500 uppercase">TOTAL</span>
                    <span className="text-2xl font-black text-blue-900 font-mono">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button 
                    onClick={() => {
                      setShowMobileCartModal(false);
                      setShowCancelModal(true);
                    }}
                    className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={() => {
                      setShowMobileCartModal(false);
                      triggerCobrar();
                    }}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer text-center shadow-md shadow-emerald-100"
                  >
                    COBRAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: PROCESAR COBRO (F12) ================= */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col md:flex-row h-auto md:h-[520px] overflow-y-auto md:overflow-hidden max-h-[95vh] md:max-h-none"
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

      {/* ================= MODAL: TICKET DE VENTA VIRTUAL ================= */}
      <AnimatePresence>
        {showSuccessModal && lastSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-6 text-slate-850 shadow-2xl relative my-8"
            >
              <div className="text-center space-y-1">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-blue-950 uppercase tracking-tight">¡Venta Registrada!</h3>
                <p className="text-xs text-slate-500 font-semibold">Se ha generado el ticket de venta digital.</p>
              </div>

              {/* Mensaje de registro de receta */}
              {showPrescriptionNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-center space-x-2 text-center shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping flex-shrink-0"></span>
                  <span>Datos de receta registrados exitosamente</span>
                </div>
              )}

              {/* Representación de ticket físico - Formato tira de farmacia */}
              <div className="bg-slate-50 text-slate-900 p-5 rounded-2xl border-2 border-slate-200/60 font-mono text-xs space-y-3 shadow-inner relative overflow-hidden">
                {/* Decorative cut details at top/bottom to simulate thermal printer paper */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 4px, transparent 5px)', backgroundSize: '12px 12px', backgroundPosition: 'center -6px' }}></div>
                
                <div className="text-center space-y-1 pt-1">
                  <p className="font-black text-sm text-blue-950 tracking-tight">FARMACIAS SAN MATÍAS</p>
                  <p className="text-[10px] text-slate-500 font-sans leading-tight">Cerrada de San Matías #148</p>
                  <p className="text-[10px] text-slate-500 font-sans leading-tight">RFC: FSM-260312-SM1</p>
                  <p className="text-[10px] text-emerald-700 font-sans font-bold">¡CUIDANDO SU SALUD!</p>
                </div>
                
                <div className="border-b-2 border-dashed border-slate-300 my-2"></div>
                
                <div className="space-y-1 text-[11px]">
                  <p className="flex justify-between"><strong>FOLIO:</strong> <span className="font-bold">{lastSale.ticketNumber}</span></p>
                  <p className="flex justify-between"><strong>FECHA:</strong> <span>{lastSale.timestamp.toLocaleDateString()} {lastSale.timestamp.toLocaleTimeString()}</span></p>
                  <p className="flex justify-between"><strong>ATENDIÓ:</strong> <span>J. Pérez</span></p>
                </div>
                
                <div className="border-b-2 border-dashed border-slate-300 my-2"></div>
                
                <div className="space-y-2 text-[11px]">
                  <div className="grid grid-cols-12 font-bold text-slate-500 pb-1">
                    <span className="col-span-7 text-left">CONCEPTO</span>
                    <span className="col-span-2 text-center">CANT</span>
                    <span className="col-span-3 text-right">TOTAL</span>
                  </div>
                  {lastSale.items.map((item) => (
                    <div key={item.product.id} className="grid grid-cols-12 text-slate-700 font-semibold py-0.5 border-b border-slate-200/30 last:border-0 leading-tight">
                      <div className="col-span-7 text-left truncate pr-1">
                        <span className="uppercase">{item.product.name}</span>
                        <span className="block text-[9px] text-slate-400 font-normal truncate">{item.product.presentation}</span>
                      </div>
                      <span className="col-span-2 text-center">x{item.quantity}</span>
                      <span className="col-span-3 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-b-2 border-dashed border-slate-300 my-2"></div>
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-black text-sm text-blue-950">
                    <span>TOTAL:</span>
                    <span>${lastSale.total.toFixed(2)} MXN</span>
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                    <span>PAGO: {lastSale.paymentMethod}</span>
                    {lastSale.paymentMethod === 'Efectivo' && (
                      <span>RECIBIDO: ${lastSale.cashReceived.toFixed(2)}</span>
                    )}
                  </div>
                  {lastSale.paymentMethod === 'Efectivo' && (
                    <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                      <span>CAMBIO:</span>
                      <span className="text-emerald-700 font-extrabold">${(lastSale.change).toFixed(2)} MXN</span>
                    </div>
                  )}
                </div>

                <div className="border-b-2 border-dashed border-slate-300 my-2"></div>
                
                <div className="text-center space-y-0.5 pt-1">
                  <p className="text-[10px] text-slate-500 font-sans font-bold">¡Gracias por su preferencia!</p>
                  <p className="text-[9px] text-slate-400 font-sans">Este no es un comprobante fiscal.</p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 4px, transparent 5px)', backgroundSize: '12px 12px', backgroundPosition: 'center 2px' }}></div>
              </div>

              {/* Botones Grandes Interactivos */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full bg-blue-950 hover:bg-blue-900 text-white font-black py-4 rounded-2xl text-sm cursor-pointer text-center shadow-lg transition-all flex items-center justify-center space-x-2.5 uppercase tracking-wider"
                >
                  <Printer className="w-5 h-5 text-white animate-bounce" />
                  <span>Imprimir Ticket</span>
                </button>
                
                <button 
                  onClick={handleSendWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-sm cursor-pointer text-center shadow-lg transition-all flex items-center justify-center space-x-2.5 uppercase tracking-wider"
                >
                  <Smartphone className="w-5 h-5 text-white" />
                  <span>Enviar por WhatsApp</span>
                </button>

                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-black py-3 rounded-xl text-xs cursor-pointer text-center transition-all uppercase tracking-wider block"
                >
                  Listo / Nueva Venta
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

      {/* ================= ALERTA DE CADUCIDAD DE LOTE (TOAST) ================= */}
      <AnimatePresence>
        {batchAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-6 max-w-sm bg-red-50 border border-red-300 rounded-xl p-4 shadow-2xl z-45 flex items-start space-x-3 text-red-950"
          >
            <div className="w-8 h-8 bg-red-100 border border-red-300 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-red-800">Alerta de Lote Próximo a Vencer</p>
              <p className="text-[11px] text-red-700 leading-normal mt-0.5 font-semibold">
                {batchAlert}
              </p>
            </div>
            <button 
              onClick={() => setBatchAlert(null)}
              className="text-red-400 hover:text-red-700 flex-shrink-0 cursor-pointer"
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
 
      {/* ================= MODAL: CONTROL DE LOTES (INTERACTIVO) ================= */}
      <AnimatePresence>
        {showLotesModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full flex flex-col h-[600px] text-slate-800"
            >
              {/* Header de Modal */}
              <div className="p-5 bg-gradient-to-r from-blue-900 to-blue-950 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg text-white">
                    +
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight">Control de Lotes y Alertas de Caducidad</h3>
                    <p className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Módulo de Trazabilidad • Farmacias San Matías</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLotesModal(false)}
                  className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido principal en dos columnas */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* COLUMNA IZQUIERDA: Listado de Productos y sus Lotes (60%) */}
                <div className="w-[60%] border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
                  <div className="p-4 border-b border-slate-200 bg-white">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Buscar medicamento para ver sus lotes..."
                        value={loteSearchQuery}
                        onChange={(e) => setLoteSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Listado con scroll */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {(() => {
                      const list = products.filter(p => 
                        p.name.toLowerCase().includes(loteSearchQuery.toLowerCase()) ||
                        p.genericName.toLowerCase().includes(loteSearchQuery.toLowerCase())
                      );

                      if (list.length === 0) {
                        return (
                          <div className="h-32 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 bg-white rounded-2xl p-4">
                            <p className="text-xs font-semibold">No se encontraron medicamentos</p>
                          </div>
                        );
                      }

                      return list.map(product => {
                        const lotesList = product.lotes || [];
                        return (
                          <div key={product.id} className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm space-y-3.5">
                            {/* Cabecera del producto */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-blue-950 uppercase">{product.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium">{product.genericName} • <span className="italic">{product.category}</span></p>
                              </div>
                              <span className="bg-slate-100 text-slate-600 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                                Stock: {product.stock} pzas
                              </span>
                            </div>

                            {/* Listado de Lotes del producto */}
                            <div className="space-y-1.5">
                              {lotesList.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic">No hay lotes registrados para este medicamento.</p>
                              ) : (
                                lotesList.map((lote, index) => {
                                  // Calcular días para caducar
                                  const now = new Date();
                                  now.setHours(0, 0, 0, 0);
                                  const exp = new Date(lote.fechaCaducidad + 'T00:00:00');
                                  exp.setHours(0, 0, 0, 0);
                                  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                                  let badgeColor = '';
                                  let textStatus = '';

                                  if (diffDays <= 30) {
                                    badgeColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
                                    textStatus = `¡URGENTE! Vence en ${diffDays} días`;
                                  } else if (diffDays <= 90) {
                                    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                                    textStatus = `Vence en ${diffDays} días (Próximo)`;
                                  } else {
                                    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                                    textStatus = `Seguro • Vence en ${diffDays} días`;
                                  }

                                  return (
                                    <div key={index} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl border border-slate-100">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-mono font-bold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px]">
                                          LOTE: {lote.codigo}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                                          CAD: {lote.fechaCaducidad}
                                        </span>
                                      </div>
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${badgeColor}`}>
                                        <span className={`w-1 h-1 rounded-full ${diffDays <= 30 ? 'bg-red-500 animate-ping' : diffDays <= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        {textStatus}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* COLUMNA DERECHA: Registro de Nuevo Lote (40%) */}
                <div className="w-[40%] p-5 flex flex-col justify-between bg-white h-full">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Entrada de Lote</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Agregue un nuevo lote para actualizar el almacén "inventario" en IndexedDB.</p>
                    </div>

                    {/* Formulario */}
                    <div className="space-y-3.5">
                      {/* Seleccionar Producto */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Seleccionar Medicamento:</label>
                        <select 
                          value={newLoteProductId} 
                          onChange={(e) => setNewLoteProductId(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                          <option value="">-- Seleccionar --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.genericName})</option>
                          ))}
                        </select>
                      </div>

                      {/* Código de Lote */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Código de Lote:</label>
                        <input 
                          type="text" 
                          placeholder="Ej. LT-AMX-505" 
                          value={newLoteCodigo}
                          onChange={(e) => setNewLoteCodigo(e.target.value.toUpperCase())}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                      </div>

                      {/* Fecha de Caducidad */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha de Caducidad:</label>
                        <input 
                          type="date" 
                          value={newLoteFecha}
                          onChange={(e) => setNewLoteFecha(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                      </div>

                      {/* Cantidad a Ingresar */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Cantidad a Ingresar (Aumentar Stock):</label>
                        <input 
                          type="number" 
                          min="1"
                          value={newLoteCantidad}
                          onChange={(e) => setNewLoteCantidad(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guardar Lote Button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      onClick={handleSaveLote}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-xs cursor-pointer text-center shadow-md hover:shadow-lg transition-all uppercase tracking-wider"
                    >
                      Guardar Lote en Inventario
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
