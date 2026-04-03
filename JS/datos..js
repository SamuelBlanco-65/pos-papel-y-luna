// =============================================
// DATOS.JS
// Variables globales del sistema.
// En el MVP 2 ya no usamos localStorage para
// productos ni ventas — todo viene de Google Sheets.
// Solo guardamos en localStorage cosas temporales
// como la venta que está abierta en este momento.
// =============================================

// URL del backend en Google Sheets
// Cambiar esta URL si se vuelve a publicar el script
var API_URL = "https://script.google.com/macros/s/AKfycbyU7xHDfKRMALsQ_6xqQv9he2uk3GkW4v3rJ3LgEiHeiOPGxD5I-uwiWCGc8sCRAYp7/exec";

// ---- VARIABLES GLOBALES ----

// Lista de productos cargada desde la API
var listaProductos = [];

// Lista de ventas cargada desde la API
var listaVentas = [];

// Lista de clientes, proveedores y categorias
var listaClientes = [];
var listaProveedores = [];
var listaCategorias = [];

// La venta que está abierta en este momento
var ventaActual = null;

// Venta en estado "abierta" (guardada para retomar)
var ventaAbierta = null;

// IDs para edicion y eliminacion
var idProductoEditando = null;
var idProductoAEliminar = null;
var entidadEditando = null;      // para clientes, proveedores, categorias
var entidadAEliminar = null;

// Para navegacion de factura
var vistaAnteriorFactura = "vista-historial";
var idUltimaVentaCerrada = null;


// ---- VENTA ABIERTA EN LOCALSTORAGE ----
// La unica cosa que guardamos localmente es la venta
// que esta en curso, para poder retomar si el usuario
// cierra y vuelve a abrir la pagina

function guardarVentaAbiertaLocal() {
    if (ventaActual && ventaActual.items.length > 0) {
        localStorage.setItem("venta_abierta_pos", JSON.stringify(ventaActual));
    } else {
        localStorage.removeItem("venta_abierta_pos");
    }
}

function cargarVentaAbiertaLocal() {
    var guardada = localStorage.getItem("venta_abierta_pos");
    if (guardada != null) {
        ventaAbierta = JSON.parse(guardada);
    }
}

function borrarVentaAbiertaLocal() {
    localStorage.removeItem("venta_abierta_pos");
    ventaAbierta = null;
}


// ---- FUNCIONES DE UTILIDAD ----

function formatearPrecio(numero) {
    var n = Number(numero);
    if (isNaN(n)) return "$ 0";
    return "$ " + n.toLocaleString("es-CO");
}

function formatearFecha(fechaISO) {
    var fecha = new Date(fechaISO);
    var dia = fecha.toLocaleDateString("es-CO");
    var hora = fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return dia + " " + hora;
}

function generarId(prefijo) {
    return prefijo + "-" + Date.now();
}

function generarCodigoProducto() {
    var numero = listaProductos.length + 1;
    return "PROD-" + String(numero).padStart(4, "0");
}